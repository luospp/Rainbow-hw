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
import { connectToDevice, disconnectDevice, getShortUUID, readCharacteristic, subscribeCharacteristic, writeCharacteristic } from "@bundle:com.endy.blehelper/entry/ets/ble/helper";
import type { BleDevice } from "@bundle:com.endy.blehelper/entry/ets/ble/helper";
import { BleWriteDialog } from "@bundle:com.endy.blehelper/entry/ets/dialogs/BleWriteDialog";
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
    constructor(r8, s8, t8, u8 = -1, v8 = undefined, w8) {
        super(r8, t8, u8, w8);
        if (typeof v8 === "function") {
            this.paramsGenerator_ = v8;
        }
        this.__bleName = new ObservedPropertySimplePU("Gi888888", this, "bleName");
        this.__macAddress = new ObservedPropertySimplePU("00:00:00:00:00:00", this, "macAddress");
        this.__deviceLog = new ObservedPropertySimplePU("", this, "deviceLog");
        this.__serviceList = new ObservedPropertyObjectPU([], this, "serviceList");
        this.characteristicReadyToWrite = "";
        this.bleWriteDialogController = new CustomDialogController({
            builder: () => {
                let x8 = new BleWriteDialog(this, {
                    confirm: (a9: string) => {
                        this.onBleWriteDialogConfirm(a9);
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Device.ets", line: 63, col: 18 });
                x8.setController(this.bleWriteDialogController);
                ViewPU.create(x8);
                let y8 = () => {
                    return {
                        confirm: (z8: string) => {
                            this.onBleWriteDialogConfirm(z8);
                        }
                    };
                };
                x8.paramsGenerator_ = y8;
            },
            alignment: DialogAlignment.Bottom
        }, this);
        this.setInitiallyProvidedValue(s8);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(q8: Device_Params) {
        if (q8.bleName !== undefined) {
            this.bleName = q8.bleName;
        }
        if (q8.macAddress !== undefined) {
            this.macAddress = q8.macAddress;
        }
        if (q8.deviceLog !== undefined) {
            this.deviceLog = q8.deviceLog;
        }
        if (q8.serviceList !== undefined) {
            this.serviceList = q8.serviceList;
        }
        if (q8.characteristicReadyToWrite !== undefined) {
            this.characteristicReadyToWrite = q8.characteristicReadyToWrite;
        }
        if (q8.bleWriteDialogController !== undefined) {
            this.bleWriteDialogController = q8.bleWriteDialogController;
        }
    }
    updateStateVars(p8: Device_Params) {
    }
    purgeVariableDependenciesOnElmtId(o8) {
        this.__bleName.purgeDependencyOnElmtId(o8);
        this.__macAddress.purgeDependencyOnElmtId(o8);
        this.__deviceLog.purgeDependencyOnElmtId(o8);
        this.__serviceList.purgeDependencyOnElmtId(o8);
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
    set bleName(n8: string) {
        this.__bleName.set(n8);
    }
    private __macAddress: ObservedPropertySimplePU<string>;
    get macAddress() {
        return this.__macAddress.get();
    }
    set macAddress(m8: string) {
        this.__macAddress.set(m8);
    }
    private __deviceLog: ObservedPropertySimplePU<string>;
    get deviceLog() {
        return this.__deviceLog.get();
    }
    set deviceLog(l8: string) {
        this.__deviceLog.set(l8);
    }
    private __serviceList: ObservedPropertyObjectPU<BleService[]>;
    get serviceList() {
        return this.__serviceList.get();
    }
    set serviceList(k8: BleService[]) {
        this.__serviceList.set(k8);
    }
    private characteristicReadyToWrite: string;
    onBleWriteDialogConfirm(j8: string) {
        this.writeBle(this.characteristicReadyToWrite, j8);
    }
    private bleWriteDialogController: CustomDialogController;
    appendLog(i8: string) {
        this.deviceLog = i8 + "\n" + this.deviceLog;
    }
    aboutToAppear(): void {
        this.bleName = (router.getParams() as BleDevice)?.name || this.bleName;
        this.macAddress = (router.getParams() as BleDevice)?.macAddress || this.macAddress;
        connectToDevice(this.macAddress, () => {
            this.appendLog(`${this.bleName} connected`);
        }, () => {
            this.onBackPress();
        }, (c8: Array<ble.GattService>) => {
            this.serviceList = [];
            c8.forEach(d8 => {
                let e8: BleService = { uuid: getShortUUID(d8.serviceUuid), characteristicList: [] };
                d8.characteristics.forEach(f8 => {
                    let g8 = f8.properties;
                    let h8: BleCharacteristic = {
                        uuid: getShortUUID(f8.characteristicUuid),
                        write: g8?.write || g8?.writeNoResponse,
                        read: g8?.read,
                        notify: g8?.notify
                    };
                    e8.characteristicList.push(h8);
                });
                this.serviceList.push(e8);
            });
        }, (a8: string, b8: string) => {
            this.appendLog(`${a8} notify: ${b8}`);
        });
    }
    aboutToDisappear() {
        disconnectDevice();
    }
    onBackPress(): boolean | void {
        router.back({
            url: 'pages/Index'
        });
        return true;
    }
    serviceHead(w7: string, x7 = null) {
        this.observeComponentCreation2((y7, z7) => {
            Text.create(w7);
            Text.width("100%");
            Text.backgroundColor("#ff5f74ff");
            Text.padding(10);
            Text.borderRadius(5);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
    }
    writeBle(u7: string, v7: string) {
        this.appendLog(`write ${u7}: ${v7}`);
        writeCharacteristic(u7, v7);
    }
    async readBle(s7: string) {
        let t7 = await readCharacteristic(s7);
        this.appendLog(`read ${s7}: ${t7}`);
    }
    subscribeBle(r7: string) {
        this.appendLog(`subscribe ${r7}`);
        subscribeCharacteristic(r7);
    }
    initialRender() {
        this.observeComponentCreation2((p7, q7) => {
            Column.create();
            Column.height('100%');
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((n7, o7) => {
            Row.create();
            Row.padding({ left: 15, right: 15 });
            Row.width("100%");
            Row.height("10%");
        }, Row);
        this.observeComponentCreation2((l7, m7) => {
            Text.create(this.bleName);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((j7, k7) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((h7, i7) => {
            Text.create(this.macAddress);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((f7, g7) => {
            List.create({ space: 10 });
            List.padding({ left: 10, right: 10 });
            List.width("100%");
            List.height("50%");
        }, List);
        this.observeComponentCreation2((q5, r5) => {
            ForEach.create();
            const s5 = t5 => {
                const u5 = t5;
                this.observeComponentCreation2((d7, e7) => {
                    ListItemGroup.create({ header: this.serviceHead.bind(this, u5.uuid) });
                    ListItemGroup.divider({
                        strokeWidth: 1,
                        color: Color.Gray,
                        startMargin: 10,
                        endMargin: 10
                    });
                }, ListItemGroup);
                this.observeComponentCreation2((v5, w5) => {
                    ForEach.create();
                    const x5 = y5 => {
                        const z5 = y5;
                        {
                            const a6 = (b7, c7) => {
                                ViewStackProcessor.StartGetAccessRecordingFor(b7);
                                ListItem.create(c6, true);
                                if (!c7) {
                                    ListItem.pop();
                                }
                                ViewStackProcessor.StopGetAccessRecording();
                            };
                            const b6 = (z6, a7) => {
                                ListItem.create(c6, true);
                                ListItem.width("100%");
                            };
                            const c6 = (d6, e6) => {
                                a6(d6, e6);
                                this.observeComponentCreation2((x6, y6) => {
                                    Row.create();
                                    Row.width("90%");
                                    Row.padding(8);
                                }, Row);
                                this.observeComponentCreation2((v6, w6) => {
                                    Text.create(z5.uuid);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((t6, u6) => {
                                    Blank.create();
                                }, Blank);
                                Blank.pop();
                                this.observeComponentCreation2((r6, s6) => {
                                    Flex.create({
                                        direction: FlexDirection.Row,
                                        alignItems: ItemAlign.Auto,
                                        justifyContent: FlexAlign.SpaceAround
                                    });
                                    Flex.width("50%");
                                }, Flex);
                                this.observeComponentCreation2((n6, o6) => {
                                    If.create();
                                    if (z5.write) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            this.observeComponentCreation2((p6, q6) => {
                                                Button.createWithLabel("写", { type: ButtonType.Circle });
                                                Button.fontSize(13);
                                                Button.padding(5);
                                                Button.onClick(() => {
                                                    this.characteristicReadyToWrite = z5.uuid;
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
                                this.observeComponentCreation2((j6, k6) => {
                                    If.create();
                                    if (z5.read) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            this.observeComponentCreation2((l6, m6) => {
                                                Button.createWithLabel("读", { type: ButtonType.Circle });
                                                Button.fontSize(13);
                                                Button.padding(5);
                                                Button.onClick(async () => {
                                                    await this.readBle(z5.uuid);
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
                                this.observeComponentCreation2((f6, g6) => {
                                    If.create();
                                    if (z5.notify) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            this.observeComponentCreation2((h6, i6) => {
                                                Button.createWithLabel("通", { type: ButtonType.Circle });
                                                Button.fontSize(13);
                                                Button.padding(5);
                                                Button.onClick(() => {
                                                    this.subscribeBle(z5.uuid);
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
                            this.observeComponentCreation2(b6, ListItem);
                            ListItem.pop();
                        }
                    };
                    this.forEachUpdateFunction(v5, u5.characteristicList, x5);
                }, ForEach);
                ForEach.pop();
                ListItemGroup.pop();
            };
            this.forEachUpdateFunction(q5, this.serviceList, s5);
        }, ForEach);
        ForEach.pop();
        List.pop();
        this.observeComponentCreation2((o5, p5) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((m5, n5) => {
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
registerNamedRoute(() => new Device(undefined, {}), "", { bundleName: "com.endy.blehelper", moduleName: "entry", pagePath: "pages/Device", pageFullPath: "entry/src/main/ets/pages/Device", integratedHsp: "false", moduleType: "followWithHap" });
