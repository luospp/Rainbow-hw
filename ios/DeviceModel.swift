import Foundation
import CoreBluetooth

struct DeviceItem: Identifiable {
    let id: UUID
    var name: String
    var rssi: Int
    let peripheral: CBPeripheral
}
