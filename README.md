# 介绍
> 主要学习使用Connectivity Kit中的蓝牙服务
>
> 可以从代码中理解BLE里面扫描、连接、断开的过程，并理解BLE设备中的服务UUID、特征值UUID，尝试读、写、订阅特征值

# 环境搭建
> ## 软件要求
> - DevEco Studio版本： DevEco Studio Next Release
> - HarmonyOS SDK版本： HarmonyOS Next Release
> ## 硬件要求
> - 设备类型：华为手机
> - HarmonyOS系统：HarmonyOS Next Release

# 代码结构解读
```
├──entry/src/main/ets                       // 代码区
│  ├─ble
│  │  └──helper.ets                         // 蓝牙工具类
│  ├─entryability
│  │  └──EntryAbility.ets                   // 程序入口类
│  ├─entryability
│  │  ├──EntryAbility.ets                   // 程序入口类
│  │  ├──BleAuthorizeDialog.ets            // 蓝牙授权弹窗
│  │  ├──BleSwitchDialog.ets               // 蓝牙开关弹窗
│  │  ├──BleWriteDialog.ets                // 蓝牙特征值写入弹窗
│  │  └──JumpToSettingDialog.ets           // 跳转系统设置弹窗
│  └─pages
│     ├──Device.ets                        // 设备操作页面
│     └──Index.ets                         // 设备搜索页面
└─entry/src/main/resources                  // 应用静态资源目录
```
# 权限相关操作
> ### 获取蓝牙权限
```typescript
// 获取应用程序的accessTokenID
let tokenId: number = 0
let grantStatus: abilityAccessCtrl.GrantStatus = abilityAccessCtrl.GrantStatus.PERMISSION_DENIED

try {
    tokenId =
        (await bundleManager.getBundleInfoForSelf(bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION)).appInfo.accessTokenId
    // 校验应用是否被授予权限
    grantStatus =
        await abilityAccessCtrl.createAtManager().checkAccessToken(tokenId, 'ohos.permission.ACCESS_BLUETOOTH')
} catch (err) {
    console.error(`getGrantStatus errCode: ${err.code}, errMessage: ${err.message}`);
}
```
> ### 获取蓝牙开关状态
```typescript
let bleState = access.BluetoothState.STATE_OFF
try {
    bleState = access.getState()
    console.debug(`get state ble state :${bleState}`)
} catch (err) {
    // 无权限
    console.error(`getBleState errCode: ${err.code}, errMessage: ${err.message}`)
}
```
> ### 请求用户授权
```typescript
let result = await abilityAccessCtrl.createAtManager()
        .requestPermissionsFromUser(context, ['ohos.permission.ACCESS_BLUETOOTH'])
        .catch((err: BusinessError) => console.error(`errCode: ${err.code}, errMessage: ${err.message}`))
if (result) {
    let grantStatus = result.authResults[0]
    console.info(`grant status: ${grantStatus}`)

    if (grantStatus === 0) {
        if (userAgreeCallback) {
            userAgreeCallback()
        }
    } else {
        if (result.dialogShownResults && result.dialogShownResults[0]) {
            // 弹窗了，用户没有同意
            if (userDenyCallback) {
                userDenyCallback()
            }
        } else {
            if (notPopCallback) {
                notPopCallback()
            }
        }
    }
} else {
    console.info("no result")
}
```
> ### 请求打开蓝牙开关
```typescript
access.on('stateChange', state => {
    if (state == access.BluetoothState.STATE_ON) {
        access.off('stateChange')
        if (bleOnCallback) {
            bleOnCallback()
        }
    }
    console.debug(`bluetooth statues: ${state}`)
})

try {
    console.debug("enableBle")
    access.enableBluetooth()
} catch (err) {
    console.error(`enableBluetooth errCode: ${err.code}, errMessage: ${err.message}`)
}
```

# 操作蓝牙设备
> ### 开始蓝牙搜索+发现设备回调
```typescript
ble.on('BLEDeviceFind', scanResult => {
    scanResultCallback(scanResult.filter(result => result.connectable).map(result => ({
        name: result.deviceName, rssi: result.rssi, macAddress: result.deviceId
    })
    ))
})
try {
    console.log("ble.startBLEScan")
    ble.startBLEScan([{}], {
        interval: 1000,
        dutyMode: ble.ScanDuty.SCAN_MODE_LOW_POWER,
        matchMode: ble.MatchMode.MATCH_MODE_AGGRESSIVE
    })
} catch (err) {
    console.error(`errCode: ${err.code}, errMessage: ${err.message}`)
}
```
> ### 连接设备
```typescript
connectedDevice = ble.createGattClientDevice(macAddress)
connectedDevice?.on('BLEConnectionStateChange', async (state: ble.BLEConnectionChangeState) => {
    let connectState: ble.ProfileConnectionState = state.state
    if (connectState === constant.ProfileConnectionState.STATE_CONNECTED) {
        if (connectedCallback) {
            connectedCallback()
        }
        connectedDevice?.on('BLECharacteristicChange', (characteristic: ble.BLECharacteristic) => {
            if (characteristicNotifyCallback) {
                characteristicNotifyCallback(getShortUUID(characteristic.characteristicUuid),
                    arrayBufferToString(characteristic.characteristicValue))
            }
        })
        serviceList = await connectedDevice?.getServices()
        if (servicesCallback) {
            servicesCallback(serviceList)
        }
    } else if (connectState === constant.ProfileConnectionState.STATE_DISCONNECTED) {
        if (disconnectedCallback) {
            disconnectedCallback()
        }
        // 这句很关键，取消订阅所有事件
        connectedDevice?.close()
        connectedDevice = null
    }
})

try {
    connectedDevice?.connect()
} catch (err) {
    console.error(`errCode: ${err.code}, errMessage: ${err.message}`)
}
```
> ### 断开连接
```typescript
try {
    connectedDevice?.disconnect()
} catch (err) {
    console.error(`errCode: ${err.code}, errMessage: ${err.message}`)
}
```
# 特征值操作
> ### 读特征值
```typescript
try {
    let result = await connectedDevice?.readCharacteristicValue(findTargetCharacteristic(characteristicUUID))
    return arrayBufferToString(result?.characteristicValue)
} catch (err) {
    console.error(`errCode: ${err.code}, errMessage: ${err.message}`)
}
```
> ### 写特征值
```typescript
let targetCharacteristic = findTargetCharacteristic(characteristicUUID)
// 把writeValue按照每两个字符串分割后按照16进制转换为数字后写入
targetCharacteristic.characteristicValue = strToArrayBuffer(writeValue)
try {
    await connectedDevice?.writeCharacteristicValue(targetCharacteristic, ble.GattWriteType.WRITE)
} catch (err) {
    console.error(`errCode: ${err.code}, errMessage: ${err.message}`)
}
```
> ### 订阅特征值变化
```typescript
try {
    connectedDevice?.setCharacteristicChangeNotification(findTargetCharacteristic(characteristicUUID), true)
} catch (err) {
    console.error(`errCode: ${err.code}, errMessage: ${err.message}`)
}
```