import Foundation

extension Data {
    init?(hexString: String) {
        var s = hexString
        if s.hasPrefix("0x") || s.hasPrefix("0X") { s = String(s.dropFirst(2)) }
        if s.count % 2 != 0 { s = "0" + s }
        var bytes = [UInt8]()
        var idx = s.startIndex
        while idx < s.endIndex {
            let next = s.index(idx, offsetBy: 2)
            let hex = String(s[idx..<next])
            if let b = UInt8(hex, radix: 16) {
                bytes.append(b)
            } else { return nil }
            idx = next
        }
        self = Data(bytes)
    }
    
    func hexString() -> String {
        return map { String(format: "%02x", $0) }.joined()
    }
}
