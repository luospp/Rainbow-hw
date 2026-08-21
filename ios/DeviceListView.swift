import SwiftUI
import CoreBluetooth

struct DeviceListView: View {
    @StateObject var ble = BLEManager()
    @State private var presentingControl: Bool = false
    @State private var selectedPeripheral: CBPeripheral?
    
    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(ble.devices) { item in
                        HStack {
                            VStack(alignment: .leading) {
                                Text(item.name).font(.headline)
                                Text("RSSI: \(item.rssi)").font(.caption)
                            }
                            Spacer()
                            Button("Connect") {
                                selectedPeripheral = item.peripheral
                                ble.connect(peripheral: item.peripheral)
                                // show control after small delay or on connect callback
                                DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                                    presentingControl = true
                                }
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                } header: {
                    Text("Discovered Devices")
                }
            }
            .navigationTitle("Rainbow HW")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Scan") {
                        ble.startScan(serviceUUIDs: nil)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Stop") {
                        ble.stopScan()
                    }
                }
            }
            .navigationDestination(isPresented: $presentingControl) {
                if let p = selectedPeripheral {
                    LightControlView(peripheral: p).environmentObject(ble)
                } else {
                    Text("No device selected")
                }
            }
        }
    }
}
