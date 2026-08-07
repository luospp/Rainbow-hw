import access from "@ohos:bluetooth.access";
import ble from "@ohos:bluetooth.ble";
import constant from "@ohos:bluetooth.constant";
import abilityAccessCtrl from "@ohos:abilityAccessCtrl";
import type common from "@ohos:app.ability.common";
import type Want from "@ohos:app.ability.Want";
import bundleManager from "@ohos:bundle.bundleManager";
import type { BusinessError } from "@ohos:base";
import type { Callback } from "@ohos:base";
import buffer from "@ohos:buffer";
import util from "@ohos:util";
export function getBleState(): access.BluetoothState {
    let bleState = access.BluetoothState.STATE_OFF;
    try {
        bleState = access.getState();
        console.debug(`get state ble state :${bleState}`);
    }
    catch (err) {
        // 无权限
        console.error(`getBleState errCode: ${err.code}, errMessage: ${err.message}`);
    }
    return bleState;
}
export async function getGrantStatus(): Promise<abilityAccessCtrl.GrantStatus> {
    // 获取应用程序的accessTokenID
    let tokenId: number = 0;
    let grantStatus: abilityAccessCtrl.GrantStatus = abilityAccessCtrl.GrantStatus.PERMISSION_DENIED;
    try {
        tokenId =
            (await bundleManager.getBundleInfoForSelf(bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION)).appInfo.accessTokenId;
        // 校验应用是否被授予权限
        grantStatus =
            await abilityAccessCtrl.createAtManager().checkAccessToken(tokenId, 'ohos.permission.ACCESS_BLUETOOTH');
    }
    catch (err) {
        console.error(`getGrantStatus errCode: ${err.code}, errMessage: ${err.message}`);
    }
    return grantStatus;
}
export async function jumpToSetting(context: common.UIAbilityContext) {
    let bundleName = (await bundleManager.getBundleInfoForSelf(bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION)).appInfo.name;
    console.log(`bundle name: ${bundleName}`);
    let wantInfo: Want = {
        bundleName: 'com.huawei.hmos.settings',
        abilityName: 'com.huawei.hmos.settings.MainAbility',
        uri: 'application_info_entry',
        parameters: {
            pushParams: bundleName // 应用的 bundleName
        }
    };
    await context.startAbility(wantInfo).catch((err: BusinessError) => {
        console.error(`startAbility errCode: ${err.code}, errMessage: ${err.message}`);
    });
}
export async function askUserAuthorize(context: common.UIAbilityContext, userAgreeCallback: Function = null, userDenyCallback: Function = null, notPopCallback: Function = null) {
    let result = await abilityAccessCtrl.createAtManager()
        .requestPermissionsFromUser(context, ['ohos.permission.ACCESS_BLUETOOTH'])
        .catch((err: BusinessError) => console.error(`errCode: ${err.code}, errMessage: ${err.message}`));
    if (result) {
        let grantStatus = result.authResults[0];
        console.info(`grant status: ${grantStatus}`);
        if (grantStatus === 0) {
            if (userAgreeCallback) {
                userAgreeCallback();
            }
        }
        else {
            if (result.dialogShownResults && result.dialogShownResults[0]) {
                // 弹窗了，用户没有同意
                if (userDenyCallback) {
                    userDenyCallback();
                }
            }
            else {
                if (notPopCallback) {
                    notPopCallback();
                }
            }
        }
    }
    else {
        console.info("no result");
    }
}
export async function enableBle(bleOnCallback: Function = null) {
    access.on('stateChange', state => {
        if (state == access.BluetoothState.STATE_ON) {
            access.off('stateChange');
            if (bleOnCallback) {
                bleOnCallback();
            }
        }
        console.debug(`bluetooth statues: ${state}`);
    });
    try {
        console.debug("enableBle");
        access.enableBluetooth();
    }
    catch (err) {
        console.error(`enableBluetooth errCode: ${err.code}, errMessage: ${err.message}`);
    }
}
export interface BleDevice {
    name: string;
    rssi: number;
    macAddress: string;
}
export async function startBleScan(scanResultCallback: Callback<Array<BleDevice>>) {
    ble.on('BLEDeviceFind', scanResult => {
        scanResultCallback(scanResult.filter(result => result.connectable).map(result => ({
            name: result.deviceName, rssi: result.rssi, macAddress: result.deviceId
        })));
    });
    try {
        console.log("ble.startBLEScan");
        ble.startBLEScan([{}], {
            interval: 1000,
            dutyMode: ble.ScanDuty.SCAN_MODE_LOW_POWER,
            matchMode: ble.MatchMode.MATCH_MODE_AGGRESSIVE
        });
    }
    catch (err) {
        console.error(`errCode: ${err.code}, errMessage: ${err.message}`);
    }
}
export function stopBleScan() {
    try {
        console.log("ble.stopBLEScan");
        ble.stopBLEScan();
    }
    catch (err) {
        console.error(`errCode: ${err.code}, errMessage: ${err.message}`);
    }
}
let connectedDevice: ble.GattClientDevice | undefined = undefined;
let serviceList: Array<ble.GattService> = [];
export async function connectToDevice(macAddress: string, connectedCallback: Function = null, disconnectedCallback: Function = null, servicesCallback: Callback<Array<ble.GattService>> = null, characteristicNotifyCallback: Function = null) {
    connectedDevice = ble.createGattClientDevice(macAddress);
    connectedDevice?.on('BLEConnectionStateChange', async (state: ble.BLEConnectionChangeState) => {
        let connectState: ble.ProfileConnectionState = state.state;
        if (connectState === constant.ProfileConnectionState.STATE_CONNECTED) {
            if (connectedCallback) {
                connectedCallback();
            }
            connectedDevice?.on('BLECharacteristicChange', (characteristic: ble.BLECharacteristic) => {
                if (characteristicNotifyCallback) {
                    characteristicNotifyCallback(getShortUUID(characteristic.characteristicUuid), arrayBufferToString(characteristic.characteristicValue));
                }
            });
            serviceList = await connectedDevice?.getServices();
            if (servicesCallback) {
                servicesCallback(serviceList);
            }
        }
        else if (connectState === constant.ProfileConnectionState.STATE_DISCONNECTED) {
            if (disconnectedCallback) {
                disconnectedCallback();
            }
            // 这句很关键，取消订阅所有事件
            connectedDevice?.close();
            connectedDevice = null;
        }
    });
    try {
        connectedDevice?.connect();
    }
    catch (err) {
        console.error(`errCode: ${err.code}, errMessage: ${err.message}`);
    }
    return connectedDevice;
}
export async function disconnectDevice() {
    try {
        connectedDevice?.disconnect();
    }
    catch (err) {
        console.error(`errCode: ${err.code}, errMessage: ${err.message}`);
    }
}
// 根据BLE协议，把UUID改为短写模式，方便操作
export const getShortUUID = (src: string): string => {
    const regex = /0000(\w{4})-/g;
    const matches = regex.exec(src);
    return matches != null ? matches[1] : src;
};
const strToArrayBuffer = (str: string): ArrayBuffer => {
    return buffer.from(str.toUpperCase().match(/[0-9A-F]{2}/g).map(s => parseInt(s, 16))).buffer;
};
const arrayBufferToString = (buff: ArrayBuffer): string => {
    let temp = "";
    let arr = new Uint8Array(buff);
    for (let i = 0; i < arr.byteLength; i++) {
        temp += arr[i].toString(16);
    }
    return temp;
};
const findTargetCharacteristic = (characteristicUUID: string): ble.BLECharacteristic | undefined => {
    let targetCharacteristic: ble.BLECharacteristic | undefined = undefined;
    serviceList.forEach(service => {
        service.characteristics.forEach(characteristic => {
            if (getShortUUID(characteristic.characteristicUuid) == characteristicUUID) {
                targetCharacteristic = characteristic;
            }
        });
    });
    if (targetCharacteristic == undefined) {
        console.error(`characteristic ${characteristicUUID} not found`);
    }
    return targetCharacteristic;
};
export const readCharacteristic = async (characteristicUUID: string): Promise<string | undefined> => {
    try {
        let result = await connectedDevice?.readCharacteristicValue(findTargetCharacteristic(characteristicUUID));
        // return arrayBufferToString(result?.characteristicValue)
        return arrToStr(result?.characteristicValue);
    }
    catch (err) {
        console.error(`errCode: ${err.code}, errMessage: ${err.message}`);
    }
};
// 发送音乐指令
export const writeMusicCharacteristic = async (writeValue: string) => {
    let targetCharacteristic = findTargetCharacteristic("FFF3");
    targetCharacteristic.characteristicValue = strToBuffer(writeValue);
    try {
        await connectedDevice?.writeCharacteristicValue(targetCharacteristic, ble.GattWriteType.WRITE);
    }
    catch (err) {
        console.error(`errCode: ${err.code}, errMessage: ${err.message}`);
    }
};
// 发送灯控指令
export const writeLightCharacteristic = async (arr: Array<string>) => {
    let targetCharacteristic = findTargetCharacteristic("FFF1");
    targetCharacteristic.characteristicValue = convertToArrayBuffer(arr);
    try {
        await connectedDevice?.writeCharacteristicValue(targetCharacteristic, ble.GattWriteType.WRITE);
    }
    catch (err) {
        console.error(`errCode: ${err.code}, errMessage: ${err.message}`);
    }
};
export const subscribeCharacteristic = (characteristicUUID: string) => {
    try {
        connectedDevice?.setCharacteristicChangeNotification(findTargetCharacteristic(characteristicUUID), true);
    }
    catch (err) {
        console.error(`errCode: ${err.code}, errMessage: ${err.message}`);
    }
};
/**
 * ASCII 解码：ArrayBuffer 转 String
 * @param arrayBuffer 待解码的二进制缓冲区
 * @returns 解码后的 ASCII 字符串（超出 ASCII 范围的字节会转为对应字符）
 */
function arrToStr(arrayBuffer: ArrayBuffer): string {
    // 1. 将 ArrayBuffer 转为 Uint8Array 二进制视图，便于遍历字节
    const uint8Array = new Uint8Array(arrayBuffer);
    let resultStr = "";
    // 2. 遍历字节，将每个字节转为对应的 ASCII 字符
    for (let i = 0; i < uint8Array.length; i++) {
        // String.fromCharCode：将字节值（0-127）转为对应 ASCII 字符
        resultStr += String.fromCharCode(uint8Array[i]);
    }
    return resultStr;
}
/**
 *  ArrayBuffer 类型返回
 * @param arr 字符串数组（如 ["[", "T", "0x00", "]"]）
 * @returns ArrayBuffer 二进制缓冲区，转换失败返回 null
 */
function convertToArrayBuffer(arr: string[]): ArrayBuffer | null {
    const byteList: number[] = []; // 先存储字节数值（0-255），后续转为 Uint8Array
    for (const element of arr) {
        let byteValue: number;
        if (element.startsWith("0x")) {
            // 处理十六进制字符串（如 "0x00" -> 0x00）
            try {
                // 截取 "0x" 后的部分，转为16进制整数
                const hexStr = element.substring(2);
                const intValue = parseInt(hexStr, 16);
                // 验证字节范围（-128 ~ 127，对应 Byte 类型）
                if (intValue < -128 || intValue > 255) {
                    console.log(`超出字节范围的十六进制值：${element}`);
                    return null;
                }
                // 转换为 Byte 对应的数值（处理无符号/有符号兼容）
                byteValue = intValue > 127 ? intValue - 256 : intValue;
            }
            catch (e) {
                console.log(`无效的十六进制值：${element}，异常信息：${e}`);
                return null;
            }
        }
        else {
            // 处理普通字符（取第一个字符的 ASCII 码）
            if (element.length === 0) {
                console.log("空字符串无法转换为字节");
                return null;
            }
            // 获取第一个字符的 ASCII 码，转为 Byte 类型
            byteValue = element.charCodeAt(0) & 0xFF; // 确保在字节范围内
        }
        byteList.push(byteValue);
    }
    // 将字节数值列表转为 Uint8Array，再获取 ArrayBuffer 返回
    const uint8Array = new Uint8Array(byteList);
    return uint8Array.buffer;
}
function strToBuffer(str: string): ArrayBuffer {
    // 1. 创建 TextEncoder 实例，默认编码为 UTF-8
    const encoder = new util.TextEncoder();
    // 2. 将字符串编码为 Uint8Array 字节数组
    const uint8Array = encoder.encode(str);
    // 3. 提取 Uint8Array 对应的 ArrayBuffer
    return uint8Array.buffer;
}
