import SwiftUI
import CoreBluetooth

struct ScheduleView: View {
    @EnvironmentObject var ble: BLEManager
    @State private var entries: [ScheduleEntry] = Array(repeating: ScheduleEntry.empty, count: 16)
    @State private var editingIndex: Int? = nil
    @State private var showingEditor: Bool = false
    @State private var statusText: String = ""
    
    var body: some View {
        VStack {
            List {
                ForEach(0..<16, id: \.self) { i in
                    let e = entries[i]
                    HStack {
                        VStack(alignment: .leading) {
                            Text(e.exists ? String(format: "%02d:%02d", e.hour, e.minute) : "空").font(.headline)
                            Text("模式: \(e.mode)  周: \(weekString(e))").font(.caption)
                        }
                        Spacer()
                        Button("编辑") {
                            editingIndex = i
                            showingEditor = true
                        }
                        .buttonStyle(.bordered)
                    }
                }
            }
            HStack {
                Button("查询时间表") {
                    ble.sendLightCommand(CommandBuilder.querySchedule())
                    statusText = "已发送查询请求，等待设备回复..."
                }
                .buttonStyle(.borderedProminent)
                
                Button("上传时间表") {
                    // collect only entries that exist; but device expects 16 entries; we send full 16
                    let data = CommandBuilder.setSchedule(entries: entries)
                    ble.sendLightCommand(data)
                    statusText = "已上传时间表"
                }
                .buttonStyle(.bordered)
            }.padding()
            Text(statusText).font(.caption).foregroundColor(.gray)
        }
        .navigationTitle("时间表")
        .sheet(isPresented: $showingEditor) {
            if let idx = editingIndex {
                ScheduleEntryEditorView(entry: $entries[idx])
            } else {
                EmptyView()
            }
        }
        .onAppear {
            // Try to load local draft
            if let saved = LocalStore.shared.loadSchedule() {
                self.entries = saved + Array(repeating: ScheduleEntry.empty, count: max(0, 16 - saved.count))
                self.entries = Array(self.entries.prefix(16))
            }
            
            // subscribe for device responses on light char
            ble.subscribe(to: BLEManager.lightChar) { data in
                // try parse schedule reply A,0x00,<64 bytes>
                parseIncoming(data: data)
            }
        }
        .onDisappear {
            LocalStore.shared.saveSchedule(entries)
        }
    }
    
    func parseIncoming(data: Data) {
        let bytes = [UInt8](data)
        guard bytes.count >= 2 else { return }
        let cmd = bytes[0]
        let sub = bytes[1]
        // 'A' == 0x41
        if cmd == UInt8(ascii: "A") && sub == 0x00 {
            // payload after first two bytes should be 16*4 = 64 bytes
            let payload = Array(bytes.dropFirst(2))
            if payload.count >= 64 {
                var newEntries: [ScheduleEntry] = []
                for i in 0..<16 {
                    let start = i*4
                    let slice = Array(payload[start..<(start+4)])
                    newEntries.append(ScheduleEntry.fromRaw(slice))
                }
                DispatchQueue.main.async {
                    self.entries = newEntries
                    LocalStore.shared.saveSchedule(newEntries)
                    statusText = "已接收时间表"
                }
            } else {
                DispatchQueue.main.async { statusText = "接收到时间表长度不够: \(payload.count)" }
            }
        } else {
            // ignore other messages
        }
    }
    
    func weekString(_ e: ScheduleEntry) -> String {
        var arr: [String] = []
        if e.mon { arr.append("一") }
        if e.tue { arr.append("二") }
        if e.wed { arr.append("三") }
        if e.thu { arr.append("四") }
        if e.fri { arr.append("五") }
        if e.sat { arr.append("六") }
        if e.sun { arr.append("日") }
        return arr.joined(separator: ",")
    }
}

struct ScheduleEntryEditorView: View {
    @Binding var entry: ScheduleEntry
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            Form {
                Toggle("启用", isOn: $entry.exists)
                HStack {
                    Text("时间")
                    Spacer()
                    Stepper(value: $entry.hour, in: 0...23) {
                        Text(String(format: "%02d", entry.hour))
                    }
                    Stepper(value: $entry.minute, in: 0...59) {
                        Text(String(format: "%02d", entry.minute))
                    }
                }
                Picker("模式", selection: $entry.mode) {
                    Text("健康(1)").tag(UInt8(1))
                    Text("工作(2)").tag(UInt8(2))
                    Text("助眠(3)").tag(UInt8(3))
                    Text("唤醒(4)").tag(UInt8(4))
                    // 自定义/其他值可直接输入
                }
                Section("周重复") {
                    Toggle("周一", isOn: $entry.mon)
                    Toggle("周二", isOn: $entry.tue)
                    Toggle("周三", isOn: $entry.wed)
                    Toggle("周四", isOn: $entry.thu)
                    Toggle("周五", isOn: $entry.fri)
                    Toggle("周六", isOn: $entry.sat)
                    Toggle("周日", isOn: $entry.sun)
                }
            }
            .navigationTitle("编辑定时")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("完成") {
                        dismiss()
                    }
                }
            }
        }
    }
}
