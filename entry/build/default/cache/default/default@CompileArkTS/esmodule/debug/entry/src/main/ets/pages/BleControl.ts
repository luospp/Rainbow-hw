if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BleControl_Params {
    macAddress?: string;
    deviceLog?: string;
    serviceList?: BleService[];
    currentTab?: number;
    connectFlag?: number;
    cBrightness?: number;
    colorTemp?: number;
    volume?: number;
    switchFlag?: boolean;
    bleWriteDialogController?: CustomDialogController;
    tempVolume?: number;
}
import router from "@ohos:router";
import type ble from "@ohos:bluetooth.ble";
import { LogUtil } from "@bundle:com.amdm.newble/entry/ets/utils/LogUtils";
import { connectToDevice, disconnectDevice, getShortUUID, readCharacteristic, subscribeCharacteristic, writeLightCharacteristic, writeMusicCharacteristic } from "@bundle:com.amdm.newble/entry/ets/ble/helper";
import type { BleDevice } from "@bundle:com.amdm.newble/entry/ets/ble/helper";
import { BleWriteDialog } from "@bundle:com.amdm.newble/entry/ets/dialogs/BleWriteDialog";
import { LampTab } from "@bundle:com.amdm.newble/entry/ets/component/LampTab";
import { BleButton } from "@bundle:com.amdm.newble/entry/ets/pages/BleButton";
interface BleService {
    uuid: string;
    characteristicList: BleCharacteristic[];
}
interface BleCharacteristic {
    uuid: string;
    write?: boolean;
    notify?: boolean;
    read?: boolean;
}
class BleControl extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__macAddress = new ObservedPropertySimplePU("00:00:00:00:00:00", this, "macAddress");
        this.__deviceLog = new ObservedPropertySimplePU("", this, "deviceLog");
        this.__serviceList = new ObservedPropertyObjectPU([], this, "serviceList");
        this.__currentTab = new ObservedPropertySimplePU(0, this, "currentTab");
        this.__connectFlag = new ObservedPropertySimplePU(0, this, "connectFlag");
        this.__cBrightness = new ObservedPropertySimplePU(0, this, "cBrightness");
        this.__colorTemp = new ObservedPropertySimplePU(0, this, "colorTemp");
        this.__volume = new ObservedPropertySimplePU(0, this, "volume");
        this.__switchFlag = new ObservedPropertySimplePU(false, this, "switchFlag");
        this.bleWriteDialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new BleWriteDialog(this, {
                    confirm: (sentValue: string) => {
                        this.sendMusicOrder(sentValue);
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/BleControl.ets", line: 43, col: 14 });
                jsDialog.setController(this.bleWriteDialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        confirm: (sentValue: string) => {
                            this.sendMusicOrder(sentValue);
                        }
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            alignment: DialogAlignment.Bottom
        }, this);
        this.__tempVolume = new ObservedPropertySimplePU(5 // 临时音量值，默认10
        , this, "tempVolume");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: BleControl_Params) {
        if (params.macAddress !== undefined) {
            this.macAddress = params.macAddress;
        }
        if (params.deviceLog !== undefined) {
            this.deviceLog = params.deviceLog;
        }
        if (params.serviceList !== undefined) {
            this.serviceList = params.serviceList;
        }
        if (params.currentTab !== undefined) {
            this.currentTab = params.currentTab;
        }
        if (params.connectFlag !== undefined) {
            this.connectFlag = params.connectFlag;
        }
        if (params.cBrightness !== undefined) {
            this.cBrightness = params.cBrightness;
        }
        if (params.colorTemp !== undefined) {
            this.colorTemp = params.colorTemp;
        }
        if (params.volume !== undefined) {
            this.volume = params.volume;
        }
        if (params.switchFlag !== undefined) {
            this.switchFlag = params.switchFlag;
        }
        if (params.bleWriteDialogController !== undefined) {
            this.bleWriteDialogController = params.bleWriteDialogController;
        }
        if (params.tempVolume !== undefined) {
            this.tempVolume = params.tempVolume;
        }
    }
    updateStateVars(params: BleControl_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__macAddress.purgeDependencyOnElmtId(rmElmtId);
        this.__deviceLog.purgeDependencyOnElmtId(rmElmtId);
        this.__serviceList.purgeDependencyOnElmtId(rmElmtId);
        this.__currentTab.purgeDependencyOnElmtId(rmElmtId);
        this.__connectFlag.purgeDependencyOnElmtId(rmElmtId);
        this.__cBrightness.purgeDependencyOnElmtId(rmElmtId);
        this.__colorTemp.purgeDependencyOnElmtId(rmElmtId);
        this.__volume.purgeDependencyOnElmtId(rmElmtId);
        this.__switchFlag.purgeDependencyOnElmtId(rmElmtId);
        this.__tempVolume.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__macAddress.aboutToBeDeleted();
        this.__deviceLog.aboutToBeDeleted();
        this.__serviceList.aboutToBeDeleted();
        this.__currentTab.aboutToBeDeleted();
        this.__connectFlag.aboutToBeDeleted();
        this.__cBrightness.aboutToBeDeleted();
        this.__colorTemp.aboutToBeDeleted();
        this.__volume.aboutToBeDeleted();
        this.__switchFlag.aboutToBeDeleted();
        this.__tempVolume.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __macAddress: ObservedPropertySimplePU<string>;
    get macAddress() {
        return this.__macAddress.get();
    }
    set macAddress(newValue: string) {
        this.__macAddress.set(newValue);
    }
    private __deviceLog: ObservedPropertySimplePU<string>;
    get deviceLog() {
        return this.__deviceLog.get();
    }
    set deviceLog(newValue: string) {
        this.__deviceLog.set(newValue);
    }
    private __serviceList: ObservedPropertyObjectPU<BleService[]>;
    get serviceList() {
        return this.__serviceList.get();
    }
    set serviceList(newValue: BleService[]) {
        this.__serviceList.set(newValue);
    }
    private __currentTab: ObservedPropertySimplePU<number>; // 0: 灯光, 1: 音乐
    get currentTab() {
        return this.__currentTab.get();
    }
    set currentTab(newValue: number) {
        this.__currentTab.set(newValue);
    }
    private __connectFlag: ObservedPropertySimplePU<number>; // 连接状态 ：1 未连接、2 连接成功 3、连接失败
    get connectFlag() {
        return this.__connectFlag.get();
    }
    set connectFlag(newValue: number) {
        this.__connectFlag.set(newValue);
    }
    private __cBrightness: ObservedPropertySimplePU<number>;
    get cBrightness() {
        return this.__cBrightness.get();
    }
    set cBrightness(newValue: number) {
        this.__cBrightness.set(newValue);
    }
    private __colorTemp: ObservedPropertySimplePU<number>;
    get colorTemp() {
        return this.__colorTemp.get();
    }
    set colorTemp(newValue: number) {
        this.__colorTemp.set(newValue);
    }
    private __volume: ObservedPropertySimplePU<number>;
    get volume() {
        return this.__volume.get();
    }
    set volume(newValue: number) {
        this.__volume.set(newValue);
    }
    private __switchFlag: ObservedPropertySimplePU<boolean>;
    get switchFlag() {
        return this.__switchFlag.get();
    }
    set switchFlag(newValue: boolean) {
        this.__switchFlag.set(newValue);
    }
    private bleWriteDialogController: CustomDialogController;
    appendLog(logText: string) {
        this.deviceLog = logText + "\n" + this.deviceLog;
        // LogUtil.d(this.deviceLog)
    }
    aboutToAppear(): void {
        this.macAddress = (router.getParams() as BleDevice)?.macAddress || this.macAddress;
        connectToDevice(this.macAddress, () => {
            this.connectFlag = 2;
        }, () => {
            //断开返回
            this.onBackPress();
        }, (serviceList: Array<ble.GattService>) => {
            this.serviceList = [];
            serviceList.forEach(service => {
                let serviceItem: BleService = { uuid: getShortUUID(service.serviceUuid), characteristicList: [] };
                service.characteristics.forEach(characteristic => {
                    let properties = characteristic.properties;
                    let characteristicItem: BleCharacteristic = {
                        uuid: getShortUUID(characteristic.characteristicUuid),
                        write: properties?.write || properties?.writeNoResponse,
                        read: properties?.read,
                        notify: properties?.notify
                    };
                    serviceItem.characteristicList.push(characteristicItem);
                });
                this.serviceList.push(serviceItem);
            });
        }, (shortUUID: string, characteristicValue: string) => {
            this.appendLog(`${shortUUID} notify: ${characteristicValue}`);
        });
    }
    aboutToDisappear() {
        disconnectDevice();
    }
    onBackPress(): boolean | void {
        const options: router.RouterOptions = {
            url: 'pages/Index',
            params: { key: 'value' } // 传递需要的参数
        };
        router.back(options);
        return true;
    }
    serviceHead(text: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(text);
            Text.width("100%");
            Text.backgroundColor("#ff5f74ff");
            Text.padding(10);
            Text.borderRadius(5);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
    }
    async readBle(shortUUID: string) {
        let result = await readCharacteristic(shortUUID);
        this.appendLog(`read ${shortUUID}: ${result}`);
    }
    subscribeBle(shortUUID: string) {
        this.appendLog(`subscribe ${shortUUID}`);
        subscribeCharacteristic("FFF1");
    }
    sendMusicOrder(order: string) {
        const str = "AT+" + order;
        writeMusicCharacteristic(str);
        this.appendLog(`write FFF3: ${str}`);
        LogUtil.d(str);
    }
    sendLightOrder(type: string, value: string) {
        let data = ["[", type, value, "]"];
        writeLightCharacteristic(data);
        this.appendLog(`write FFF3: ${data}`);
        LogUtil.d(data.toString());
    }
    connectStr(): string {
        let state = "";
        switch (this.connectFlag) {
            case 1: {
                state = "正在连接";
            }
            case 2: {
                state = "蓝牙已连接";
            }
        }
        return state;
    }
    connectColor(): ResourceColor {
        let color: ResourceColor = { "id": 16777253, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" };
        switch (this.connectFlag) {
            case 1: {
                color = { "id": 16777253, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" };
            }
            case 2: {
                color = { "id": 16777252, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" };
            }
            // case 3: {
            //   color = $r('app.color.disconnected')
            // }
        }
        LogUtil.d("蓝牙连接状态：" + this.connectFlag);
        return color;
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
            Column.width('100%');
            Column.backgroundColor({ "id": 16777250, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部图片区域
            Stack.create({ alignContent: Alignment.TopStart });
            // 顶部图片区域
            Stack.width('100%');
            // 顶部图片区域
            Stack.height(240);
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 背景图片
            Image.create({ "id": 16777323, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            // 背景图片
            Image.width('100%');
            // 背景图片
            Image.height(240);
            // 背景图片
            Image.objectFit(ImageFit.Cover);
            // 背景图片
            Image.backgroundColor(Color.Black);
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 顶部内容
            Column.create({ space: 0 });
            // 顶部内容
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 第一行：Logo和连接状态
            Row.create({ space: 0 });
            // 第一行：Logo和连接状态
            Row.width('100%');
            // 第一行：Logo和连接状态
            Row.margin({ top: 26 });
            // 第一行：Logo和连接状态
            Row.justifyContent(FlexAlign.Start);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Logo
            Image.create({ "id": 16777324, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            // Logo
            Image.width(80);
            // Logo
            Image.height(21);
            // Logo
            Image.margin({ left: 16 });
            // Logo
            Image.align(Alignment.Start);
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 连接状态
            Text.create(this.connectStr());
            // 连接状态
            Text.constraintSize({ minWidth: 80 });
            // 连接状态
            Text.height(20);
            // 连接状态
            Text.fontSize(12);
            // 连接状态
            Text.textAlign(TextAlign.Center);
            // 连接状态
            Text.fontColor(Color.White);
            // 连接状态
            Text.backgroundColor(this.connectColor());
            // 连接状态
            Text.borderRadius(10);
            // 连接状态
            Text.padding({
                left: 6,
                right: 6,
                top: 2,
                bottom: 2
            });
            // 连接状态
            Text.margin({ right: 14 });
        }, Text);
        // 连接状态
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 设置按钮
            Image.create({ "id": 16777293, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            // 设置按钮
            Image.width(15);
            // 设置按钮
            Image.height(15);
            // 设置按钮
            Image.margin({ right: 14 });
            // 设置按钮
            Image.opacity(0.7);
            // 设置按钮
            Image.onClick(() => {
                // 跳转到设置页面
                LogUtil.d("打开设置界面");
                this.bleWriteDialogController.open();
            });
        }, Image);
        // 第一行：Logo和连接状态
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 主标题和副标题
            Column.create();
            // 主标题和副标题
            Column.alignItems(HorizontalAlign.Start);
            // 主标题和副标题
            Column.margin({ left: 16, top: 20 });
            // 主标题和副标题
            Column.align(Alignment.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777240, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(30);
            Text.fontColor(Color.White);
            Text.margin({ top: 20 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777244, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(20);
            Text.fontColor(Color.White);
            Text.margin({ top: 10 });
        }, Text);
        Text.pop();
        // 主标题和副标题
        Column.pop();
        // 顶部内容
        Column.pop();
        // 顶部图片区域
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 主内容区域
            Column.create({ space: 0 });
            // 主内容区域
            Column.width('100%');
            // 主内容区域
            Column.margin({ top: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 0 });
            Column.backgroundColor({ "id": 16777260, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(20);
            Column.padding(20);
            Column.margin({ left: 18, right: 18, top: -29 });
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new 
                    // Tab切换
                    LampTab(this, {
                        // 传递回调函数
                        onTabSelected: (index: number) => {
                            this.currentTab = index;
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/BleControl.ets", line: 247, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            // 传递回调函数
                            onTabSelected: (index: number) => {
                                this.currentTab = index;
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "LampTab" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 根据当前Tab显示不同内容
            if (this.currentTab === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    // 灯光控制
                    this.LightControlView.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    // 音乐控制
                    this.MusicControlView.bind(this)();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 滑块控制区域
            if (this.currentTab === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.LightSeekbarView.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.MusicSeekbarView.bind(this)();
                });
            }
        }, If);
        If.pop();
        // 主内容区域
        Column.pop();
        Column.pop();
    }
    // 灯光控制视图
    LightControlView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 开关和方向控制行
            Row.create();
            // 开关和方向控制行
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            __Common__.create();
            __Common__.margin({ right: 36, top: 10 });
        }, __Common__);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new 
                    // 开关按钮
                    BleButton(this, {
                        buttonText: { "id": 16777236, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" },
                        icon: { "id": 16777300, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" },
                        textColor: { "id": 16777256, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" },
                        onButtonClick: () => {
                            // 开关控制
                            const order = this.switchFlag ? "0x00" : "0x01";
                            this.switchFlag = !this.switchFlag;
                            this.sendLightOrder("T", order);
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/BleControl.ets", line: 296, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            buttonText: { "id": 16777236, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" },
                            icon: { "id": 16777300, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" },
                            textColor: { "id": 16777256, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" },
                            onButtonClick: () => {
                                // 开关控制
                                const order = this.switchFlag ? "0x00" : "0x01";
                                this.switchFlag = !this.switchFlag;
                                this.sendLightOrder("T", order);
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        buttonText: { "id": 16777236, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" },
                        icon: { "id": 16777300, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" },
                        textColor: { "id": 16777256, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" }
                    });
                }
            }, { name: "BleButton" });
        }
        __Common__.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 方向控制
            Column.create({ space: 0 });
            // 方向控制
            Column.backgroundColor({ "id": 16777254, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            // 方向控制
            Column.borderRadius(30);
            // 方向控制
            Column.height(50);
            // 方向控制
            Column.layoutWeight(1);
            // 方向控制
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.margin({ top: 3 });
            Row.width('100%');
            Row.justifyContent(FlexAlign.SpaceBetween);
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 向上
            Column.create({ space: 8 });
            // 向上
            Column.margin({ left: 15 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(44);
            Column.height(44);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(22);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // 向上控制
                this.sendLightOrder("E", "0x01");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777303, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.width(20);
            Image.height(20);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777245, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777258, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        // 向上
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 停止
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(44);
            Column.height(44);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(22);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // 停止控制
                this.sendLightOrder("E", "0x00");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777289, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.width(20);
            Image.height(20);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777243, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777258, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        // 停止
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 向下
            Column.create({ space: 8 });
            // 向下
            Column.margin({ right: 15 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(44);
            Column.height(44);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(22);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // 向下控制
                this.sendLightOrder("E", "0x02");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777278, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.width(20);
            Image.height(20);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777227, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777258, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        // 向下
        Column.pop();
        Row.pop();
        // 方向控制
        Column.pop();
        // 开关和方向控制行
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 模式选择
            Column.create({ space: 10 });
            // 模式选择
            Column.width('100%');
            // 模式选择
            Column.margin({ top: 22 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 0 });
            Row.width('100%');
            Row.justifyContent(FlexAlign.SpaceBetween);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 唤醒模式
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(50);
            Column.height(50);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(50);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // 唤醒模式
                this.sendLightOrder("M", "0x01");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777304, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.objectFit(ImageFit.Fill);
            Image.width(19);
            Image.height(19);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777247, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777252, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        // 唤醒模式
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 工作模式
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(50);
            Column.height(50);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(50);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // 工作模式
                this.sendLightOrder("M", "0x03");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777306, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.objectFit(ImageFit.Fill);
            Image.width(22);
            Image.height(18);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777249, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777252, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        // 工作模式
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 健康模式
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(50);
            Column.height(50);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(50);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // 健康模式
                this.sendLightOrder("M", "0x04");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777279, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.objectFit(ImageFit.Fill);
            Image.width(16);
            Image.height(19);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777228, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777252, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        // 健康模式
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 睡眠模式
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(50);
            Column.height(50);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(50);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // 睡眠模式
                this.sendLightOrder("M", "0x02");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777295, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.objectFit(ImageFit.Fill);
            Image.width(21);
            Image.height(17);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777242, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777252, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        // 睡眠模式
        Column.pop();
        Row.pop();
        // 模式选择
        Column.pop();
        Column.pop();
    }
    // 音乐控制视图
    MusicControlView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 0 });
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 音乐播放控制
            Column.create({ space: 8 });
            // 音乐播放控制
            Column.backgroundColor({ "id": 16777254, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            // 音乐播放控制
            Column.borderRadius(30);
            // 音乐播放控制
            Column.height(50);
            // 音乐播放控制
            Column.width('100%');
            // 音乐播放控制
            Column.margin({ top: 20 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 28 });
            Row.width('100%');
            Row.margin({ top: 3 });
            Row.justifyContent(FlexAlign.SpaceBetween);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 上一首
            Column.create({ space: 8 });
            // 上一首
            Column.margin({ left: 28 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(44);
            Column.height(44);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(22);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // 上一首
                this.sendMusicOrder("CC");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777291, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.width(20);
            Image.height(20);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777239, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777258, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 10 });
        }, Text);
        Text.pop();
        // 上一首
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 播放/暂停
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(44);
            Column.height(44);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(22);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // 播放/暂停
                this.sendMusicOrder("CB");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777289, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.width(24);
            Image.height(24);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777238, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777258, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 10 });
        }, Text);
        Text.pop();
        // 播放/暂停
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 下一首
            Column.create({ space: 8 });
            // 下一首
            Column.margin({ right: 28 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(44);
            Column.height(44);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(22);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // 下一首
                this.sendMusicOrder("CD");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777287, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.width(20);
            Image.height(20);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777235, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777258, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 10 });
        }, Text);
        Text.pop();
        // 下一首
        Column.pop();
        Row.pop();
        // 音乐播放控制
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 音乐模式选择
            Column.create({ space: 10 });
            // 音乐模式选择
            Column.margin({ top: 30 });
            // 音乐模式选择
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 0 });
            Row.width('100%');
            Row.justifyContent(FlexAlign.SpaceBetween);
            Row.margin({ top: 20 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 列表循环
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(50);
            Column.height(50);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(50);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // 列表循环
                this.sendMusicOrder("AC00");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777281, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.objectFit(ImageFit.Fill);
            Image.width(17);
            Image.height(18);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777230, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777252, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        // 列表循环
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 单曲循环
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(50);
            Column.height(50);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(50);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // 单曲循环
                this.sendMusicOrder("AC02");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777294, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.objectFit(ImageFit.Fill);
            Image.width(19);
            Image.height(18);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777241, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777252, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        // 单曲循环
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 本地模式
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(50);
            Column.height(50);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(50);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // 本地模式
                this.sendMusicOrder("CM03");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777283, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.objectFit(ImageFit.Fill);
            Image.width(14);
            Image.height(18);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777231, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777252, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        // 本地模式
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // BLE模式
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(50);
            Column.height(50);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(50);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                // BLE模式
                this.sendMusicOrder("CM01");
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777272, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.objectFit(ImageFit.Fill);
            Image.width(14);
            Image.height(18);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777223, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777252, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 6 });
        }, Text);
        Text.pop();
        // BLE模式
        Column.pop();
        Row.pop();
        // 音乐模式选择
        Column.pop();
        Column.pop();
    }
    // 灯光滑块视图
    LightSeekbarView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.backgroundColor({ "id": 16777260, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(20);
            Column.padding({
                left: 20,
                right: 20,
            });
            Column.margin({ top: 17, left: 18, right: 18 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 亮度控制
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(50);
            Column.height(50);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(50);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777276, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.objectFit(ImageFit.Fill);
            Image.width(20);
            Image.height(16);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
            Column.margin({ left: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777226, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(14);
            Text.fontColor({ "id": 16777258, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ left: 14, top: 35 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.cBrightness} %`);
            Text.fontSize(14);
            Text.fontColor({ "id": 16777258, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 35 });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Slider.create({
                value: this.cBrightness,
                min: 0,
                max: 100,
                step: 1,
                style: SliderStyle.OutSet
            });
            Slider.width('100%');
            Slider.margin({ bottom: 20 });
            Slider.onTouch((touch: TouchEvent) => {
                if (touch.type == TouchType.Up) {
                    // 发送亮度控制命令
                    const cValue = this.cBrightness.toString(16).toUpperCase();
                    this.sendLightOrder("P", cValue);
                }
            });
            Slider.onChange((value: number) => {
                this.cBrightness = value;
            });
        }, Slider);
        Column.pop();
        // 亮度控制
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 色温控制
            Row.create({ space: 0 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(50);
            Column.height(50);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(50);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777301, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.objectFit(ImageFit.Fill);
            Image.width(19);
            Image.height(16);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
            Column.margin({ left: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777225, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(14);
            Text.fontColor({ "id": 16777259, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ left: 14, top: 35 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.getColorTempText(this.colorTemp));
            Text.fontSize(14);
            Text.fontColor({ "id": 16777259, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ right: 20, top: 35 });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Slider.create({
                value: this.colorTemp,
                min: 0,
                max: 100,
                step: 1,
                style: SliderStyle.OutSet
            });
            Slider.trackColor(new LinearGradient([
                { color: '#E45106', offset: 0.0 },
                { color: '#E48735', offset: 0.5 },
                { color: '#5975EF', offset: 1.0 }
            ]));
            Slider.width('100%');
            Slider.margin({ bottom: 20 });
            Slider.onTouch((touch: TouchEvent) => {
                if (touch.type == TouchType.Up) {
                    // 发送亮度控制命令
                    const cValue = this.cBrightness.toString(16).toUpperCase();
                    this.sendLightOrder("C", cValue);
                }
            });
            Slider.onChange((value: number) => {
                this.colorTemp = value;
            });
        }, Slider);
        Column.pop();
        // 色温控制
        Row.pop();
        Column.pop();
    }
    // 音乐滑块视图
    MusicSeekbarView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.backgroundColor({ "id": 16777260, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(20);
            Column.padding({
                left: 20,
                right: 20,
            });
            Column.alignItems(HorizontalAlign.Center);
            Column.justifyContent(FlexAlign.Center);
            Column.margin({ top: 16, left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(50);
            Column.height(50);
            Column.backgroundColor({ "id": 16777251, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Column.borderRadius(50);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777298, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Image.objectFit(ImageFit.Fill);
            Image.width(17);
            Image.height(13);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 0 });
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 0 });
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777246, "type": 10003, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.fontSize(12);
            Text.fontColor({ "id": 16777258, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ left: 10, top: 35 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.volume.toString());
            Text.fontSize(12);
            Text.fontColor({ "id": 16777258, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Text.margin({ top: 35 });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Slider.create({
                value: this.volume,
                min: 0,
                max: 30,
                step: 1,
                style: SliderStyle.OutSet
            });
            Slider.width('100%');
            Slider.margin({ bottom: 20, left: 30, right: 20 });
            Slider.onTouch((touch: TouchEvent) => {
                if (touch.type == TouchType.Up) {
                    // 发送音量控制命令
                    // this.sendMusicOrder("CA" + this.volume)
                    this.onStopTrackingTouch(this.volume);
                }
            });
            Slider.onChange((value: number) => {
                this.volume = value;
            });
        }, Slider);
        Column.pop();
        Row.pop();
        Column.pop();
    }
    // 首先，在组件中定义相关的状态变量
    private __tempVolume: ObservedPropertySimplePU<number>; // 临时音量值，默认10
    get tempVolume() {
        return this.__tempVolume.get();
    }
    set tempVolume(newValue: number) {
        this.__tempVolume.set(newValue);
    }
    onStopTrackingTouch(progress: number) {
        if (progress !== undefined && progress !== null) {
            // 大于10直接发数字
            if (progress >= 10) {
                this.sendMusicOrder("CA" + progress);
                this.tempVolume = progress;
            }
            else {
                if (this.tempVolume > 10) {
                    this.sendMusicOrder("CA10");
                    this.tempVolume = 10;
                }
                if (this.tempVolume === 10 || this.tempVolume > progress) {
                    const vSub = this.tempVolume - progress;
                    this.handVolume(vSub, progress, "CF");
                }
                else if (this.tempVolume < progress) {
                    const vSub = progress - this.tempVolume;
                    this.handVolume(vSub, progress, "CE");
                }
            }
        }
    }
    private async handVolume(vSub: number, progress: number, order: string): Promise<void> {
        // 创建一个异步任务来模拟Kotlin的lifecycleScope.launch(Dispatchers.IO)
        for (let i = 0; i < vSub; i++) {
            // 延迟500毫秒，对应delay(Duration.ofMillis(500))
            await this.delay(500);
            this.sendMusicOrder(order);
        }
        // 更新临时音量值
        this.tempVolume = progress;
    }
    // 延迟函数
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            // 使用setTimeout实现延迟
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }
    // 获取色温文本描述
    private getColorTempTextss(value: number): string {
        return "冷色";
    }
    private getColorTempText(progress: number): string {
        // 对应 Kotlin 中的 when 语句，使用 TypeScript switch/if-else 实现分支判断
        if (progress >= 0 && progress <= 30) {
            return "温暖";
        }
        else if (progress >= 31 && progress <= 50) {
            return "温暖";
        }
        else if (progress >= 51 && progress <= 70) {
            return "白光";
        }
        else if (progress >= 71 && progress <= 100) {
            return "冷白";
        }
        else {
            return "温暖";
        }
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "BleControl";
    }
}
registerNamedRoute(() => new BleControl(undefined, {}), "", { bundleName: "com.amdm.newble", moduleName: "entry", pagePath: "pages/BleControl", pageFullPath: "entry/src/main/ets/pages/BleControl", integratedHsp: "false", moduleType: "followWithHap" });
