import Foundation

// 单个定时项模型
struct ScheduleEntry: Codable, Equatable {
    var hour: Int
    var minute: Int
    var mode: UInt8
    var exists: Bool
    // week flags
    var mon: Bool
    var tue: Bool
    var wed: Bool
    var thu: Bool
    var fri: Bool
    var sat: Bool
    var sun: Bool
    
    static let empty = ScheduleEntry(hour: 0, minute: 0, mode: 0, exists: false, mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false)
    
    // compute weekByte following CommandBuilder.weekByte convention
    var weekByte: UInt8 {
        CommandBuilder.weekByte(exists: exists, mon: mon, tue: tue, wed: wed, thu: thu, fri: fri, sat: sat, sun: sun)
    }
    
    // convenience: build from raw 4 bytes (hour,minute,mode,weekByte)
    static func fromRaw(_ bytes: [UInt8]) -> ScheduleEntry {
        guard bytes.count >= 4 else { return ScheduleEntry.empty }
        let hour = Int(bytes[0])
        let minute = Int(bytes[1])
        let mode = bytes[2]
        let wb = bytes[3]
        let exists = (wb & 0x01) != 0
        func bit(_ mask: UInt8) -> Bool { (wb & mask) != 0 }
        return ScheduleEntry(hour: hour, minute: minute, mode: mode, exists: exists,
                             mon: bit(0x02), tue: bit(0x04), wed: bit(0x08), thu: bit(0x10),
                             fri: bit(0x20), sat: bit(0x40), sun: bit(0x80))
    }
    
    func toRaw() -> [UInt8] {
        [UInt8(hour & 0xFF), UInt8(minute & 0xFF), mode, weekByte]
    }
}
