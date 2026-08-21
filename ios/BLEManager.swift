import Foundation
import CoreBluetooth
import Combine
import SwiftUI

final class BLEManager: NSObject, ObservableObject {
    @Published var devices: [DeviceItem] = []
    @Published var connectedPeripheral: CBPeripheral?
    @Published var connectionState: String = "disconnected"
    
    private var central: CBCentralManager!
    private var foundPeripherals: [UUID: (peripheral: CBPeripheral, rssi: Int)] = [:]
    private var targetCharacteristics: [CBUUID: CBCharacteristic] = [:]
    private var characteristicListeners: [CBUUID: (Data) -> Void] = [:]
    
    // default short UUIDs used in repo
    static let lightChar = CBUUID(string: "FFF1")
    static let musicChar = CBUUID(string: "FFF3")
    
    override init() {
        super.init()
        central = CBCentralManager(delegate: self, queue: nil)
    }
    
    // MARK: - Scanning
    func startScan(serviceUUIDs: [CBUUID]? = nil) {
        guard central.state == .poweredOn else { return }
        devices.removeAll()
        foundPeripherals.removeAll()
        central.scanForPeripherals(withServices: serviceUUIDs, options: [CBCentralManagerScanOptionAllowDuplicatesKey: false])
    }
    func stopScan() {
        central.stopScan()
    }
    
    // MARK: - Connect / Disconnect
    func connect(peripheral: CBPeripheral) {
        central.connect(peripheral, options: nil)
        peripheral.delegate = self
    }
    func disconnect() {
        if let p = connectedPeripheral {
            central.cancelPeripheralConnection(p)
        }
    }
    
    // MARK: - Read/Write/Subscribe
    func write(data: Data, to characteristicUUID: CBUUID, writeWithResponse: Bool = false) {
        guard let peripheral = connectedPeripheral,
              let char = targetCharacteristics[characteristicUUID] else { return }
        let type: CBCharacteristicWriteType = writeWithResponse ? .withResponse : .withoutResponse
        peripheral.writeValue(data, for: char, type: type)
    }
    
    func subscribe(to characteristicUUID: CBUUID, callback: @escaping (Data) -> Void) {
        guard let peripheral = connectedPeripheral,
              let char = targetCharacteristics[characteristicUUID] else { return }
        characteristicListeners[characteristicUUID] = callback
        peripheral.setNotifyValue(true, for: char)
    }
    
    // Convenience wrappers for protocol-specific writes
    func sendLightCommand(_ data: Data) {
        write(data: data, to: Self.lightChar, writeWithResponse: false)
    }
    func sendMusicCommand(_ data: Data) {
        write(data: data, to: Self.musicChar, writeWithResponse: false)
    }
}

// MARK: - CBCentralManagerDelegate
extension BLEManager: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        // handle different states
        switch central.state {
        case .unknown, .resetting, .unsupported, .unauthorized, .poweredOff:
            connectionState = "off"
        case .poweredOn:
            connectionState = "on"
        @unknown default:
            connectionState = "unknown"
        }
    }
    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral,
                        advertisementData: [String : Any], rssi RSSI: NSNumber) {
        let uuid = peripheral.identifier
        if foundPeripherals[uuid] == nil {
            foundPeripherals[uuid] = (peripheral, RSSI.intValue)
            devices.append(DeviceItem(id: uuid, name: peripheral.name ?? "Unknown", rssi: RSSI.intValue, peripheral: peripheral))
        } else {
            // update RSSI if needed
            foundPeripherals[uuid]?.rssi = RSSI.intValue
            if let idx = devices.firstIndex(where: { $0.id == uuid }) {
                devices[idx].rssi = RSSI.intValue
            }
        }
    }
    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        connectedPeripheral = peripheral
        connectionState = "connected"
        peripheral.discoverServices(nil)
    }
    func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        connectionState = "failed"
    }
    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        if connectedPeripheral?.identifier == peripheral.identifier {
            connectedPeripheral = nil
        }
        connectionState = "disconnected"
    }
}

// MARK: - CBPeripheralDelegate
extension BLEManager: CBPeripheralDelegate {
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        guard let services = peripheral.services else { return }
        for s in services {
            peripheral.discoverCharacteristics(nil, for: s)
        }
    }
    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        guard let chars = service.characteristics else { return }
        for c in chars {
            targetCharacteristics[c.uuid] = c
            // auto-subscribe to notify characteristics if desired
            if c.properties.contains(.notify) {
                peripheral.setNotifyValue(true, for: c)
            }
        }
    }
    func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        guard let data = characteristic.value else { return }
        if let cb = characteristicListeners[characteristic.uuid] {
            cb(data)
        } else {
            // You can broadcast notifications or parse default status messages here
            print("Received \(characteristic.uuid): \(data.hexString())")
        }
    }
}
