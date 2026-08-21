# PR: feat(iOS): add SwiftUI prototype (BLE manager, device list, control, schedule/mode/time)

This PR adds an iOS SwiftUI prototype for the Rainbow-hw project. It targets iOS 18.0 and includes:

- BLEManager: CoreBluetooth wrapper to scan/connect/discover characteristics, read/write, and subscribe to notifications.
- CommandBuilder: protocol command construction (bare payload style, first byte is ASCII command code).
- Device list UI and Light control UI (SwiftUI).
- Time configuration, Mode Durations, and Schedule pages (query/set/edit) with local persistence via UserDefaults.
- Hex/Data utilities and small data models.

Notes:
- The code assumes short UUIDs: FFF1 (light) and FFF3 (music) for characteristic write/notify; change if your device uses different UUIDs.
- Command framing is "bare payload" (no leading '[' or trailing ']').
- Parsing of device replies is implemented based on the provided protocol assumptions; please provide capture logs from the real device to finalize parsing.

How to test:
1. Open the project files in Xcode, set the deployment target to iOS 18.0.
2. Add the listed Swift files into the project and ensure Info.plist contains NSBluetoothAlwaysUsageDescription and NSBluetoothPeripheralUsageDescription.
3. Build and run on a real iPhone (simulator won’t support BLE).

Future work:
- Adjust parsers to match actual device reply payloads once capture logs are available.
- Optional: implement OTA if required by device.
