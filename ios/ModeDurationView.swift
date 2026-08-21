import SwiftUI

struct ModeDurationView: View {
    @EnvironmentObject var ble: BLEManager
    @State private var durations: [UInt16] = Array(repeating: 0, count: 8)
    @State private var status: String = ""
    
    var body: some View {
        VStack {
            Form {
                ForEach(0..<8, id: \.self) { idx in
                    HStack {
                        Text("模式 \(idx+1)")
                        Spacer()
                        TextField("时长", value: Binding(get: {
                            Int(durations[idx])
                        }, set: { newv in
                            durations[idx] = UInt16(newv & 0xFFFF)
                        }), formatter: NumberFormatter())
                        .keyboardType(.numberPad)
                        Text("单位: 未确认")
                    }
                }
            }
            HStack {
                Button("查询时长") {
                    ble.sendLightCommand(CommandBuilder.queryModeDurations())
                    status = "已请求模式时长"
                }.buttonStyle(.borderedProminent)
                
                Button("上传时长") {
                    let data = CommandBuilder.setModeDurations(durations)
                    ble.sendLightCommand(data)
                    status = "已上传模式时长"
                    LocalStore.shared.saveModeDurations(durations)
                }.buttonStyle(.bordered)
            }.padding()
            Text(status).font(.caption).foregroundColor(.gray)
        }
        .navigationTitle("模式时长")
        .onAppear {
            if let saved = LocalStore.shared.loadModeDurations() {
                durations = saved + Array(repeating: 0, count: max(0, 8 - saved.count))
                durations = Array(durations.prefix(8))
            }
            // subscribe for S replies
            ble.subscribe(to: BLEManager.lightChar) { data in
                parseIncoming(data: data)
            }
        }
        .onDisappear {
            LocalStore.shared.saveModeDurations(durations)
        }
    }
    
    func parseIncoming(data: Data) {
        let bytes = [UInt8](data)
        guard bytes.count >= 2 else { return }
        let cmd = bytes[0]
        let sub = bytes[1]
        if cmd == UInt8(ascii: "S") && sub == 0x00 {
            let payload = Array(bytes.dropFirst(2))
            if payload.count >= 16 {
                var new: [UInt16] = []
                for i in 0..<8 {
                    let low = UInt16(payload[i*2])
                    let high = UInt16(payload[i*2 + 1])
                    let v = (high << 8) | low
                    new.append(v)
                }
                DispatchQueue.main.async {
                    self.durations = new
                    LocalStore.shared.saveModeDurations(new)
                    status = "已接收模式时长"
                }
            } else {
                DispatchQueue.main.async { status = "接收到的模式时长长度不够: \(payload.count)" }
            }
        }
    }
}
