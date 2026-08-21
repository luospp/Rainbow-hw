import SwiftUI
import CoreBluetooth

struct LightControlView: View {
    @EnvironmentObject var ble: BLEManager
    let peripheral: CBPeripheral
    
    @State private var brightness: Double = 44 // example default 0x2c
    @State private var colorValue: Double = 77 // example 0x4d
    
    var body: some View {
        VStack(spacing: 20) {
            Text(peripheral.name ?? "Device").font(.title)
            HStack(spacing: 16) {
                Button("On") {
                    ble.sendLightCommand(CommandBuilder.turnOn())
                }
                .buttonStyle(.borderedProminent)
                
                Button("Off") {
                    ble.sendLightCommand(CommandBuilder.turnOff())
                }
                .buttonStyle(.bordered)
            }
            
            VStack(alignment: .leading) {
                Text("Brightness: \(Int(brightness))")
                Slider(value: $brightness, in: 0...255, step: 1) {
                    Text("Brightness")
                } onEditingChanged: { editing in
                    if !editing {
                        let bv = UInt8(brightness)
                        ble.sendLightCommand(CommandBuilder.setBrightness(bv))
                    }
                }
            }.padding()
            
            VStack(alignment: .leading) {
                Text("Color: \(Int(colorValue))")
                Slider(value: $colorValue, in: 0...255, step: 1) {
                    Text("Color")
                } onEditingChanged: { editing in
                    if !editing {
                        let cv = UInt8(colorValue)
                        ble.sendLightCommand(CommandBuilder.setColor(cv))
                    }
                }
            }.padding()
            
            Spacer()
            
            NavigationLink("时间设置", destination: TimeConfigView().environmentObject(ble))
            NavigationLink("模式时长", destination: ModeDurationView().environmentObject(ble))
            NavigationLink("时间表", destination: ScheduleView().environmentObject(ble))
        }
        .padding()
        .onAppear {
            // Optionally subscribe to notifications on FFF1/FFF3 to get status
            ble.subscribe(to: BLEManager.lightChar) { data in
                print("light char notify: \(data.hexString())")
                // You can parse responses here to update UI
            }
            ble.subscribe(to: BLEManager.musicChar) { data in
                print("music char notify: \(data.hexString())")
            }
        }
        .navigationTitle("Control")
    }
}
