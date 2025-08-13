import { access, ble, constant } from '@kit.ConnectivityKit'
import { abilityAccessCtrl, common, Want } from '@kit.AbilityKit'
import { bundleManager } from '@kit.AbilityKit'
import { BusinessError, Callback } from '@kit.BasicServicesKit'
import { buffer } from '@kit.ArkTS'

export function getBleState(): access.BluetoothState {
    let bleState = access.BluetoothState.STATE_OFF
    try {
        bleState = access.getState()
        console.debug(`get state ble state :${bleState}`)
    } catch (err) {
        // 无权限
        console.error(`getBleState errCode: ${err.code}, errMessage: ${err.message}`)
    }
    return bleState
}

export async function getGrantStatus(): Promise<abilityAccessCtrl.GrantStatus> {
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
    return grantStatus
}

export async function jumpToSetting(context: common.UIAbilityContext) {
    let bundleName =
        (await bundleManager.getBundleInfoForSelf(bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION)).appInfo.name
    console.log(`bundle name: ${bundleName}`)
    let wantInfo: Want = {
        bundleName: 'com.huawei.hmos.settings',
        abilityName: 'com.huawei.hmos.settings.MainAbility',
        uri: 'application_info_entry',
        parameters: {
            pushParams: bundleName // 应用的 bundleName
        }
    }

    await context.startAbility(wantInfo).catch((err: BusinessError) => {
        console.error(`startAbility errCode: ${err.code}, errMessage: ${err.message}`)
    })
}

export async function askUserAuthorize(context: common.UIAbilityContext,
    userAgreeCallback: Function = null,
    userDenyCallback: Function = null,
    notPopCallback: Function = null) {
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
}

export async function enableBle(bleOnCallback: Function = null) {
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
}

export interface BleDevice {
    name: string
    rssi: number
    macAddress: string
}

export async function startBleScan(scanResultCallback: Callback<Array<BleDevice>>) {
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
}

export function stopBleScan() {
    try {
        console.log("ble.stopBLEScan")
        ble.stopBLEScan();
    } catch (err) {
        console.error(`errCode: ${err.code}, errMessage: ${err.message}`)
    }
}

let connectedDevice: ble.GattClientDevice | undefined = undefined
let serviceList: Array<ble.GattService> = []

export async function connectToDevice(macAddress: string, connectedCallback: Function = null,
    disconnectedCallback: Function = null,
    servicesCallback: Callback<Array<ble.GattService>> = null,
    characteristicNotifyCallback: Function = null) {
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
    return connectedDevice
}

export async function disconnectDevice() {
    try {
        connectedDevice?.disconnect()
    } catch (err) {
        console.error(`errCode: ${err.code}, errMessage: ${err.message}`)
    }
}

// 根据BLE协议，把UUID改为短写模式，方便操作
export const getShortUUID = (src: string): string => {
    const regex = /0000(\w{4})-/g
    const matches = regex.exec(src)
    return matches != null ? matches[1] : src
}

const strToArrayBuffer = (str: string): ArrayBuffer => {
    return buffer.from(str.toUpperCase().match(/[0-9A-F]{2}/g).map(s => parseInt(s, 16))).buffer
}

const arrayBufferToString = (buff: ArrayBuffer): string => {
    let temp = ""
    let arr=new Uint8Array(buff)
    for (let i = 0; i < arr.byteLength; i++) {
        temp += arr[i].toString(16)
    }
    return temp
}


const findTargetCharacteristic = (characteristicUUID: string): ble.BLECharacteristic | undefined => {
    let targetCharacteristic: ble.BLECharacteristic | undefined = undefined

    serviceList.forEach(service => {
        service.characteristics.forEach(characteristic => {
            if (getShortUUID(characteristic.characteristicUuid) == characteristicUUID) {
                targetCharacteristic = characteristic
            }
        })
    })

    if (targetCharacteristic == undefined) {
        console.error(`characteristic ${characteristicUUID} not found`)
    }

    return targetCharacteristic
}


export const readCharacteristic = async (characteristicUUID: string): Promise<string | undefined> => {
    try {
        let result = await connectedDevice?.readCharacteristicValue(findTargetCharacteristic(characteristicUUID))
        return arrayBufferToString(result?.characteristicValue)
    } catch (err) {
        console.error(`errCode: ${err.code}, errMessage: ${err.message}`)
    }
}

export const writeCharacteristic = async (characteristicUUID: string, writeValue: string) => {
    let targetCharacteristic = findTargetCharacteristic(characteristicUUID)
    // 把writeValue按照每两个字符串分割后按照16进制转换为数字后写入
    targetCharacteristic.characteristicValue = strToArrayBuffer(writeValue)
    try {
        await connectedDevice?.writeCharacteristicValue(targetCharacteristic, ble.GattWriteType.WRITE)
    } catch (err) {
        console.error(`errCode: ${err.code}, errMessage: ${err.message}`)
    }
}

export const subscribeCharacteristic = (characteristicUUID: string) => {
    try {
        connectedDevice?.setCharacteristicChangeNotification(findTargetCharacteristic(characteristicUUID), true)
    } catch (err) {
        console.error(`errCode: ${err.code}, errMessage: ${err.message}`)
    }
}
