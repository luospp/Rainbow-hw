import SwiftUI

struct TimeConfigView: View {
    @EnvironmentObject var ble: BLEManager
    @State private var now = Date()
    @State private var status: String = ""
    
    var body: some View {
        VStack(spacing: 16) {
            DatePicker("当前时间", selection: $now)
                .datePickerStyle(.compact)
                .labelsHidden()
                .padding()
            HStack {
                Button("查询设备时间") {
                    ble.sendLightCommand(CommandBuilder.queryTime())
                    status = "已发送时间查询"
                }.buttonStyle(.borderedProminent)
                
                Button("校时到设备") {
                    let cal = Calendar.current
                    let comps = cal.dateComponents([.year, .month, .day, .hour, .minute, .second], from: now)
                    let year = UInt8((comps.year ?? 2000) % 100)
                    let month = UInt8(comps.month ?? 1)
                    let day = UInt8(comps.day ?? 1)
                    let hour = UInt8(comps.hour ?? 0)
                    let minute = UInt8(comps.minute ?? 0)
                    let second = UInt8(comps.second ?? 0)
                    let data = CommandBuilder.setTime(year: year, month: month, day: day, hour: hour, minute: minute, second: second)
                    ble.sendLightCommand(data)
                    status = "已校时"
                }.buttonStyle(.bordered)
            }
            Text(status).font(.caption).foregroundColor(.gray)
        }
        .navigationTitle("时间设置")
        .padding()
        .onAppear {
            ble.subscribe(to: BLEManager.lightChar) { data in
                parseIncoming(data: data)
            }
        }
    }
    
    func parseIncoming(data: Data) {
        let bytes = [UInt8](data)
        guard bytes.count >= 2 else { return }
        let cmd = bytes[0]
        let sub = bytes[1]
        if cmd == UInt8(ascii: "D") && sub == 0x00 {
            // expect D,0x00,year,month,day,hour,minute,second
            let payload = Array(bytes.dropFirst(2))
            if payload.count >= 6 {
                let year = Int(payload[0]) + 2000
                let month = Int(payload[1])
                let day = Int(payload[2])
                let hour = Int(payload[3])
                let minute = Int(payload[4])
                let second = Int(payload[5])
                var comps = DateComponents()
                comps.year = year; comps.month = month; comps.day = day
                comps.hour = hour; comps.minute = minute; comps.second = second
                let cal = Calendar.current
                if let d = cal.date(from: comps) {
                    DispatchQueue.main.async {
                        self.now = d
                        self.status = "已接收设备时间"
                    }
                }
            } else {
                DispatchQueue.main.async { status = "接收到时间长度不够" }
            }
        }
    }
}
