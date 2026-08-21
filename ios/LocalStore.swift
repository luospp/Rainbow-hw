import Foundation

/// 简单的本地持久化（UserDefaults JSON）
class LocalStore {
    static let shared = LocalStore()
    private let scheduleKey = "rainbow_schedule_v1"
    private let modeDurationsKey = "rainbow_mode_durations_v1"
    
    func saveSchedule(_ entries: [ScheduleEntry]) {
        if let data = try? JSONEncoder().encode(entries) {
            UserDefaults.standard.set(data, forKey: scheduleKey)
        }
    }
    func loadSchedule() -> [ScheduleEntry]? {
        guard let data = UserDefaults.standard.data(forKey: scheduleKey),
              let arr = try? JSONDecoder().decode([ScheduleEntry].self, from: data) else { return nil }
        return arr
    }
    
    func saveModeDurations(_ durations: [UInt16]) {
        let arr = durations.map { Int($0) }
        UserDefaults.standard.set(arr, forKey: modeDurationsKey)
    }
    func loadModeDurations() -> [UInt16]? {
        guard let arr = UserDefaults.standard.array(forKey: modeDurationsKey) as? [Int] else { return nil }
        return arr.map { UInt16($0 & 0xFFFF) }
    }
}
