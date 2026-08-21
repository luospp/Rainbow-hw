import Foundation

/// 生成原始协议命令（裸 payload）
/// 协议约定：首字节为 ASCII 命令码（'T','P','C','E','M','D','A','S','V','U','O' 等），后续跟参数字节（如果有）。
struct CommandBuilder {
    private static func codeByte(_ char: Character) -> UInt8 {
        return UInt8(String(char).utf8.first ?? 0)
    }
    
    private static func singleByteCommand(code: Character, value: UInt8) -> Data {
        return Data([codeByte(code), value])
    }
    
    // 灯控命令
    static func turnOn() -> Data { singleByteCommand(code: "T", value: 0x01) }
    static func turnOff() -> Data { singleByteCommand(code: "T", value: 0x00) }
    static func setBrightness(_ v: UInt8) -> Data { singleByteCommand(code: "P", value: v) }
    static func setColor(_ v: UInt8) -> Data { singleByteCommand(code: "C", value: v) }
    
    // 电机
    static func motorStop() -> Data { singleByteCommand(code: "E", value: 0x00) }
    static func motorUp() -> Data { singleByteCommand(code: "E", value: 0x01) }
    static func motorDown() -> Data { singleByteCommand(code: "E", value: 0x02) }
    
    // 模式示例（M）
    static func setMode(_ v: UInt8) -> Data { singleByteCommand(code: "M", value: v) }
    
    // 时间设置示例（D,0x01,年,月,日,时,分,秒） 年为 year % 100
    static func setTime(year: UInt8, month: UInt8, day: UInt8, hour: UInt8, minute: UInt8, second: UInt8) -> Data {
        return Data([codeByte("D"), 0x01, year, month, day, hour, minute, second])
    }
    static func queryTime() -> Data { Data([codeByte("D"), 0x00]) }
    
    // 时间表：A,0x01, <16 * 4 bytes(time entries)>  每个 entry: hour, minute, mode, weekByte
    static func setSchedule(entries: [ScheduleEntry]) -> Data {
        var bytes = [UInt8]()
        bytes.append(codeByte("A"))
        bytes.append(0x01)
        // ensure length 16
        let padded = entries + Array(repeating: ScheduleEntry.empty, count: max(0, 16 - entries.count))
        let slice = padded.prefix(16)
        for e in slice {
            bytes.append(UInt8(e.hour & 0xFF))
            bytes.append(UInt8(e.minute & 0xFF))
            bytes.append(UInt8(e.mode & 0xFF))
            bytes.append(e.weekByte)
        }
        return Data(bytes)
    }
    static func querySchedule() -> Data { Data([codeByte("A"), 0x00]) }
    
    // 模式时长：S,0x01, then 8 uint16 little-endian (16 bytes)
    static func setModeDurations(_ durations: [UInt16]) -> Data {
        var bytes = [UInt8]()
        bytes.append(codeByte("S"))
        bytes.append(0x01)
        // pad to 8
        let padded = durations + Array(repeating: 0, count: max(0, 8 - durations.count))
        let slice = padded.prefix(8)
        for v in slice {
            let low = UInt8(v & 0xFF)
            let high = UInt8((v >> 8) & 0xFF)
            bytes.append(low)
            bytes.append(high)
        }
        return Data(bytes)
    }
    static func queryModeDurations() -> Data { Data([codeByte("S"), 0x00]) }
    
    // 版本/状态/other queries
    static func queryVersion() -> Data { Data([codeByte("V"), 0x00]) }
    static func queryStatus() -> Data { Data([codeByte("U"), 0x00]) }
    
    // helper to construct weekByte:
    // bit0: existence flag (1 = exists, 0 = not exist)
    // bits1-7: Mon..Sun (1 = enabled)
    static func weekByte(exists: Bool, mon: Bool, tue: Bool, wed: Bool, thu: Bool, fri: Bool, sat: Bool, sun: Bool) -> UInt8 {
        var b: UInt8 = 0
        if exists { b |= 0x01 } // 0位
        if mon  { b |= 0x02 }   // 1位
        if tue  { b |= 0x04 }   // 2位
        if wed  { b |= 0x08 }   // 3位
        if thu  { b |= 0x10 }   // 4位
        if fri  { b |= 0x20 }   // 5位
        if sat  { b |= 0x40 }   // 6位
        if sun  { b |= 0x80 }   // 7位
        return b
    }
}
