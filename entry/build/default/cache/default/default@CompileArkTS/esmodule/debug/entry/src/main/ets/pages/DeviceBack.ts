if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Device_Params {
    bleName?: string;
    macAddress?: string;
    deviceLog?: string;
    serviceList?: BleService[];
    characteristicReadyToWrite?: string;
    bleWriteDialogController?: CustomDialogController;
}
import router from "@ohos:router";
import type ble from "@ohos:bluetooth.ble";
import { connectToDevice, disconnectDevice, getShortUUID, readCharacteristic, subscribeCharacteristic, writeMusicCharacteristic } from "@bundle:com.amdm.newble/entry/ets/ble/helper";
import type { BleDevice } from "@bundle:com.amdm.newble/entry/ets/ble/helper";
import { BleWriteDialog } from "@bundle:com.amdm.newble/entry/ets/dialogs/BleWriteDialog";
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
class Device extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__bleName = new ObservedPropertySimplePU("Gi888888", this, "bleName");
        this.__macAddress = new ObservedPropertySimplePU("00:00:00:00:00:00", this, "macAddress");
        this.__deviceLog = new ObservedPropertySimplePU("", this, "deviceLog");
        this.__serviceList = new ObservedPropertyObjectPU([]
        // 在编写界面的时候，可以解开这一段调试界面样式
        // @State serviceList: BleService[] = [{
        //     uuid: "AAAA",
        //     characteristicList: [{
        //         uuid: "BBBB",
        //         read: true,
        //         notify: true,
        //         write: true
        //     }, { uuid: "CCCC", write: true }]
        // }, {
        //     uuid: "AAAA",
        //     characteristicList: [{ uuid: "BBBB", read: true, notify: true }, { uuid: "CCCC", write: true }]
        // }, {
        //     uuid: "AAAA",
        //     characteristicList: [{ uuid: "BBBB", read: true, notify: true }, { uuid: "CCCC", write: true }]
        // }, {
        //     uuid: "AAAA",
        //     characteristicList: [{ uuid: "BBBB", read: true, notify: true }, { uuid: "CCCC", write: true }]
        // }]
        , this, "serviceList");
        this.characteristicReadyToWrite = "";
        this.bleWriteDialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new BleWriteDialog(this, {
                    confirm: (sentValue: string) => {
                        this.onBleWriteDialogConfirm(sentValue);
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/DeviceBack.ets", line: 62, col: 14 });
                jsDialog.setController(this.bleWriteDialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        confirm: (sentValue: string) => {
                            this.onBleWriteDialogConfirm(sentValue);
                        }
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            alignment: DialogAlignment.Bottom
        }, this);
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Device_Params) {
        if (params.bleName !== undefined) {
            this.bleName = params.bleName;
        }
        if (params.macAddress !== undefined) {
            this.macAddress = params.macAddress;
        }
        if (params.deviceLog !== undefined) {
            this.deviceLog = params.deviceLog;
        }
        if (params.serviceList !== undefined) {
            this.serviceList = params.serviceList;
        }
        if (params.characteristicReadyToWrite !== undefined) {
            this.characteristicReadyToWrite = params.characteristicReadyToWrite;
        }
        if (params.bleWriteDialogController !== undefined) {
            this.bleWriteDialogController = params.bleWriteDialogController;
        }
    }
    updateStateVars(params: Device_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__bleName.purgeDependencyOnElmtId(rmElmtId);
        this.__macAddress.purgeDependencyOnElmtId(rmElmtId);
        this.__deviceLog.purgeDependencyOnElmtId(rmElmtId);
        this.__serviceList.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__bleName.aboutToBeDeleted();
        this.__macAddress.aboutToBeDeleted();
        this.__deviceLog.aboutToBeDeleted();
        this.__serviceList.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __bleName: ObservedPropertySimplePU<string>;
    get bleName() {
        return this.__bleName.get();
    }
    set bleName(newValue: string) {
        this.__bleName.set(newValue);
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
    // 在编写界面的时候，可以解开这一段调试界面样式
    // @State serviceList: BleService[] = [{
    //     uuid: "AAAA",
    //     characteristicList: [{
    //         uuid: "BBBB",
    //         read: true,
    //         notify: true,
    //         write: true
    //     }, { uuid: "CCCC", write: true }]
    // }, {
    //     uuid: "AAAA",
    //     characteristicList: [{ uuid: "BBBB", read: true, notify: true }, { uuid: "CCCC", write: true }]
    // }, {
    //     uuid: "AAAA",
    //     characteristicList: [{ uuid: "BBBB", read: true, notify: true }, { uuid: "CCCC", write: true }]
    // }, {
    //     uuid: "AAAA",
    //     characteristicList: [{ uuid: "BBBB", read: true, notify: true }, { uuid: "CCCC", write: true }]
    // }]
    private characteristicReadyToWrite: string;
    onBleWriteDialogConfirm(sentValue: string) {
        // console.log(sentValue)
        this.writeBle(this.characteristicReadyToWrite, sentValue);
    }
    private bleWriteDialogController: CustomDialogController;
    appendLog(logText: string) {
        this.deviceLog = logText + "\n" + this.deviceLog;
    }
    aboutToAppear(): void {
        this.bleName = (router.getParams() as BleDevice)?.name || this.bleName;
        this.macAddress = (router.getParams() as BleDevice)?.macAddress || this.macAddress;
        connectToDevice(this.macAddress, () => {
            this.appendLog(`${this.bleName} connected`);
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
    writeBle(shortUUID: string, writeValue: string) {
        this.appendLog(`write ${shortUUID}: ${writeValue}`);
        writeMusicCharacteristic(writeValue);
    }
    async readBle(shortUUID: string) {
        let result = await readCharacteristic(shortUUID);
        this.appendLog(`read ${shortUUID}: ${result}`);
    }
    subscribeBle(shortUUID: string) {
        this.appendLog(`subscribe ${shortUUID}`);
        subscribeCharacteristic(shortUUID);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.padding({ left: 15, right: 15 });
            Row.width("100%");
            Row.height("10%");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.bleName);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.macAddress);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create({ space: 10 });
            List.padding({ left: 10, right: 10 });
            List.width("100%");
            List.height("50%");
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const service = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    ListItemGroup.create({ header: this.serviceHead.bind(this, service.uuid) });
                    ListItemGroup.divider({
                        strokeWidth: 1,
                        color: Color.Gray,
                        startMargin: 10,
                        endMargin: 10
                    });
                }, ListItemGroup);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    ForEach.create();
                    const forEachItemGenFunction = _item => {
                        const characteristic = _item;
                        {
                            const itemCreation = (elmtId, isInitialRender) => {
                                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                ListItem.create(deepRenderFunction, true);
                                if (!isInitialRender) {
                                    ListItem.pop();
                                }
                                ViewStackProcessor.StopGetAccessRecording();
                            };
                            const itemCreation2 = (elmtId, isInitialRender) => {
                                ListItem.create(deepRenderFunction, true);
                                ListItem.width("100%");
                            };
                            const deepRenderFunction = (elmtId, isInitialRender) => {
                                itemCreation(elmtId, isInitialRender);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.width("90%");
                                    Row.padding(8);
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(characteristic.uuid);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Blank.create();
                                }, Blank);
                                Blank.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Flex.create({
                                        direction: FlexDirection.Row,
                                        alignItems: ItemAlign.Auto,
                                        justifyContent: FlexAlign.SpaceAround
                                    });
                                    Flex.width("50%");
                                }, Flex);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    If.create();
                                    if (characteristic.write) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Button.createWithLabel("写", { type: ButtonType.Circle });
                                                Button.fontSize(13);
                                                Button.padding(5);
                                                Button.onClick(() => {
                                                    this.characteristicReadyToWrite = characteristic.uuid;
                                                    // 打开指令输入弹窗
                                                    this.bleWriteDialogController.open();
                                                });
                                            }, Button);
                                            Button.pop();
                                        });
                                    }
                                    else {
                                        this.ifElseBranchUpdateFunction(1, () => {
                                        });
                                    }
                                }, If);
                                If.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    If.create();
                                    if (characteristic.read) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Button.createWithLabel("读", { type: ButtonType.Circle });
                                                Button.fontSize(13);
                                                Button.padding(5);
                                                Button.onClick(async () => {
                                                    await this.readBle(characteristic.uuid);
                                                });
                                            }, Button);
                                            Button.pop();
                                        });
                                    }
                                    else {
                                        this.ifElseBranchUpdateFunction(1, () => {
                                        });
                                    }
                                }, If);
                                If.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    If.create();
                                    if (characteristic.notify) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Button.createWithLabel("通", { type: ButtonType.Circle });
                                                Button.fontSize(13);
                                                Button.padding(5);
                                                Button.onClick(() => {
                                                    this.subscribeBle(characteristic.uuid);
                                                });
                                            }, Button);
                                            Button.pop();
                                        });
                                    }
                                    else {
                                        this.ifElseBranchUpdateFunction(1, () => {
                                        });
                                    }
                                }, If);
                                If.pop();
                                Flex.pop();
                                Row.pop();
                                ListItem.pop();
                            };
                            this.observeComponentCreation2(itemCreation2, ListItem);
                            ListItem.pop();
                        }
                    };
                    this.forEachUpdateFunction(elmtId, service.characteristicList, forEachItemGenFunction);
                }, ForEach);
                ForEach.pop();
                ListItemGroup.pop();
            };
            this.forEachUpdateFunction(elmtId, this.serviceList, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        List.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextArea.create({ text: this.deviceLog });
            TextArea.padding(10);
            TextArea.width("100%");
            TextArea.height('30%');
            TextArea.backgroundColor(Color.Transparent);
        }, TextArea);
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Device";
    }
}
registerNamedRoute(() => new Device(undefined, {}), "", { bundleName: "com.amdm.newble", moduleName: "entry", pagePath: "pages/DeviceBack", pageFullPath: "entry/src/main/ets/pages/DeviceBack", integratedHsp: "false", moduleType: "followWithHap" });
