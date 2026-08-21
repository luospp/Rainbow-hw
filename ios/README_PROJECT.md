# Rainbow-hw iOS SwiftUI prototype

Target: iOS 18.0
Requires: physical iPhone for BLE testing

Setup:
1. In Xcode create a new "App" project (Interface: SwiftUI, Life Cycle: SwiftUI App).
2. Set Deployment Target to iOS 18.0.
3. Replace the default App file content with RainbowHWApp.swift.
4. Add the other Swift files into the project: BLEManager.swift, CommandBuilder.swift, HexUtils.swift, DeviceModel.swift, DeviceListView.swift, LightControlView.swift.
5. Update Info.plist: add NSBluetoothAlwaysUsageDescription and NSBluetoothPeripheralUsageDescription strings (see provided Info.plist).
6. Build & Run on a real device.
7. On DeviceListView tap Scan, then Connect for a discovered device, then control in Control page.

Notes:
- Simulator does not support CoreBluetooth. Use a real iPhone.
- The code assumes characteristic short UUIDs "FFF1" for light and "FFF3" for music (as found in repo). Adjust if device uses different UUIDs or service UUID filtering is desired.
- The command frame is a bare payload where the first byte is the ASCII command code (e.g., 'T', 'P', ...). Adjust CommandBuilder if device framing differs.
