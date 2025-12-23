import access from "@ohos:bluetooth.access";
import ble from "@ohos:bluetooth.ble";
import constant from "@ohos:bluetooth.constant";
import abilityAccessCtrl from "@ohos:abilityAccessCtrl";
import type common from "@ohos:app.ability.common";
import type Want from "@ohos:app.ability.Want";
import bundleManager from "@ohos:bundle.bundleManager";
import type { BusinessError as BusinessError } from "@ohos:base";
import type { Callback as Callback } from "@ohos:base";
import buffer from "@ohos:buffer";
export function getBleState(): access.BluetoothState {
    let d2 = access.BluetoothState.STATE_OFF;
    try {
        d2 = access.getState();
        console.debug(`get state ble state :${d2}`);
    }
    catch (e2) {
        console.error(`getBleState errCode: ${e2.code}, errMessage: ${e2.message}`);
    }
    return d2;
}
export async function getGrantStatus(): Promise<abilityAccessCtrl.GrantStatus> {
    let a2: number = 0;
    let b2: abilityAccessCtrl.GrantStatus = abilityAccessCtrl.GrantStatus.PERMISSION_DENIED;
    try {
        a2 =
            (await bundleManager.getBundleInfoForSelf(bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION)).appInfo.accessTokenId;
        b2 =
            await abilityAccessCtrl.createAtManager().checkAccessToken(a2, 'ohos.permission.ACCESS_BLUETOOTH');
    }
    catch (c2) {
        console.error(`getGrantStatus errCode: ${c2.code}, errMessage: ${c2.message}`);
    }
    return b2;
}
export async function jumpToSetting(w1: common.UIAbilityContext) {
    let x1 = (await bundleManager.getBundleInfoForSelf(bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION)).appInfo.name;
    console.log(`bundle name: ${x1}`);
    let y1: Want = {
        bundleName: 'com.huawei.hmos.settings',
        abilityName: 'com.huawei.hmos.settings.MainAbility',
        uri: 'application_info_entry',
        parameters: {
            pushParams: x1
        }
    };
    await w1.startAbility(y1).catch((z1: BusinessError) => {
        console.error(`startAbility errCode: ${z1.code}, errMessage: ${z1.message}`);
    });
}
export async function askUserAuthorize(p1: common.UIAbilityContext, q1: Function = null, r1: Function = null, s1: Function = null) {
    let t1 = await abilityAccessCtrl.createAtManager()
        .requestPermissionsFromUser(p1, ['ohos.permission.ACCESS_BLUETOOTH'])
        .catch((v1: BusinessError) => console.error(`errCode: ${v1.code}, errMessage: ${v1.message}`));
    if (t1) {
        let u1 = t1.authResults[0];
        console.info(`grant status: ${u1}`);
        if (u1 === 0) {
            if (q1) {
                q1();
            }
        }
        else {
            if (t1.dialogShownResults && t1.dialogShownResults[0]) {
                if (r1) {
                    r1();
                }
            }
            else {
                if (s1) {
                    s1();
                }
            }
        }
    }
    else {
        console.info("no result");
    }
}
export async function enableBle(m1: Function = null) {
    access.on('stateChange', o1 => {
        if (o1 == access.BluetoothState.STATE_ON) {
            access.off('stateChange');
            if (m1) {
                m1();
            }
        }
        console.debug(`bluetooth statues: ${o1}`);
    });
    try {
        console.debug("enableBle");
        access.enableBluetooth();
    }
    catch (n1) {
        console.error(`enableBluetooth errCode: ${n1.code}, errMessage: ${n1.message}`);
    }
}
export interface BleDevice {
    name: string;
    rssi: number;
    macAddress: string;
}
export async function startBleScan(h1: Callback<Array<BleDevice>>) {
    ble.on('BLEDeviceFind', j1 => {
        h1(j1.filter(l1 => l1.connectable).map(k1 => ({
            name: k1.deviceName, rssi: k1.rssi, macAddress: k1.deviceId
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
    catch (i1) {
        console.error(`errCode: ${i1.code}, errMessage: ${i1.message}`);
    }
}
export function stopBleScan() {
    try {
        console.log("ble.stopBLEScan");
        ble.stopBLEScan();
    }
    catch (g1) {
        console.error(`errCode: ${g1.code}, errMessage: ${g1.message}`);
    }
}
let connectedDevice: ble.GattClientDevice | undefined = undefined;
let serviceList: Array<ble.GattService> = [];
export async function connectToDevice(x: string, y: Function = null, z: Function = null, a1: Callback<Array<ble.GattService>> = null, b1: Function = null) {
    connectedDevice = ble.createGattClientDevice(x);
    connectedDevice?.on('BLEConnectionStateChange', async (d1: ble.BLEConnectionChangeState) => {
        let e1: ble.ProfileConnectionState = d1.state;
        if (e1 === constant.ProfileConnectionState.STATE_CONNECTED) {
            if (y) {
                y();
            }
            connectedDevice?.on('BLECharacteristicChange', (f1: ble.BLECharacteristic) => {
                if (b1) {
                    b1(getShortUUID(f1.characteristicUuid), arrayBufferToString(f1.characteristicValue));
                }
            });
            serviceList = await connectedDevice?.getServices();
            if (a1) {
                a1(serviceList);
            }
        }
        else if (e1 === constant.ProfileConnectionState.STATE_DISCONNECTED) {
            if (z) {
                z();
            }
            connectedDevice?.close();
            connectedDevice = null;
        }
    });
    try {
        connectedDevice?.connect();
    }
    catch (c1) {
        console.error(`errCode: ${c1.code}, errMessage: ${c1.message}`);
    }
    return connectedDevice;
}
export async function disconnectDevice() {
    try {
        connectedDevice?.disconnect();
    }
    catch (w) {
        console.error(`errCode: ${w.code}, errMessage: ${w.message}`);
    }
}
export const getShortUUID = (t: string): string => {
    const u = /0000(\w{4})-/g;
    const v = u.exec(t);
    return v != null ? v[1] : t;
};
const strToArrayBuffer = (r: string): ArrayBuffer => {
    return buffer.from(r.toUpperCase().match(/[0-9A-F]{2}/g).map(s => parseInt(s, 16))).buffer;
};
const arrayBufferToString = (n: ArrayBuffer): string => {
    let o = "";
    let p = new Uint8Array(n);
    for (let q = 0; q < p.byteLength; q++) {
        o += p[q].toString(16);
    }
    return o;
};
const findTargetCharacteristic = (j: string): ble.BLECharacteristic | undefined => {
    let k: ble.BLECharacteristic | undefined = undefined;
    serviceList.forEach(l => {
        l.characteristics.forEach(m => {
            if (getShortUUID(m.characteristicUuid) == j) {
                k = m;
            }
        });
    });
    if (k == undefined) {
        console.error(`characteristic ${j} not found`);
    }
    return k;
};
export const readCharacteristic = async (g: string): Promise<string | undefined> => {
    try {
        let i = await connectedDevice?.readCharacteristicValue(findTargetCharacteristic(g));
        return arrayBufferToString(i?.characteristicValue);
    }
    catch (h) {
        console.error(`errCode: ${h.code}, errMessage: ${h.message}`);
    }
};
export const writeCharacteristic = async (c: string, d: string) => {
    let e = findTargetCharacteristic(c);
    e.characteristicValue = strToArrayBuffer(d);
    try {
        await connectedDevice?.writeCharacteristicValue(e, ble.GattWriteType.WRITE);
    }
    catch (f) {
        console.error(`errCode: ${f.code}, errMessage: ${f.message}`);
    }
};
export const subscribeCharacteristic = (a: string) => {
    try {
        connectedDevice?.setCharacteristicChangeNotification(findTargetCharacteristic(a), true);
    }
    catch (b) {
        console.error(`errCode: ${b.code}, errMessage: ${b.message}`);
    }
};
