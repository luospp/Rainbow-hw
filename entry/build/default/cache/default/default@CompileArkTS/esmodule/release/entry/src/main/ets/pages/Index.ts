if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Index_Params {
    bleItemList?: Array<BleDevice>;
    bleScanning?: boolean;
    scanTimer?;
    bleAuthorizeDialogController?: CustomDialogController;
    bleSwitchDialogController?: CustomDialogController;
    jumpToSettingDialogController?: CustomDialogController;
}
import access from "@ohos:bluetooth.access";
import abilityAccessCtrl from "@ohos:abilityAccessCtrl";
import type common from "@ohos:app.ability.common";
import router from "@ohos:router";
import { askUserAuthorize, enableBle, getBleState, getGrantStatus, jumpToSetting, startBleScan, stopBleScan } from "@bundle:com.endy.blehelper/entry/ets/ble/helper";
import type { BleDevice } from "@bundle:com.endy.blehelper/entry/ets/ble/helper";
import { JumpToSettingDialog } from "@bundle:com.endy.blehelper/entry/ets/dialogs/JumpToSettingDialog";
import { BleAuthorizeDialog } from "@bundle:com.endy.blehelper/entry/ets/dialogs/BleAuthorizeDialog";
import { BleSwitchDialog } from "@bundle:com.endy.blehelper/entry/ets/dialogs/BleSwitchDialog";
class Index extends ViewPU {
    constructor(s10, t10, u10, v10 = -1, w10 = undefined, x10) {
        super(s10, u10, v10, x10);
        if (typeof w10 === "function") {
            this.paramsGenerator_ = w10;
        }
        this.__bleItemList = new ObservedPropertyObjectPU([], this, "bleItemList");
        this.__bleScanning = new ObservedPropertySimplePU(false, this, "bleScanning");
        this.scanTimer = -1;
        this.bleAuthorizeDialogController = new CustomDialogController({
            builder: () => {
                let c11 = new BleAuthorizeDialog(this, {
                    confirm: () => {
                        this.onBleAuthorizeDialogConfirm();
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 26, col: 18 });
                c11.setController(this.bleAuthorizeDialogController);
                ViewPU.create(c11);
                let d11 = () => {
                    return {
                        confirm: () => {
                            this.onBleAuthorizeDialogConfirm();
                        }
                    };
                };
                c11.paramsGenerator_ = d11;
            },
            alignment: DialogAlignment.Bottom
        }, this);
        this.bleSwitchDialogController = new CustomDialogController({
            builder: () => {
                let a11 = new BleSwitchDialog(this, {
                    confirm: () => {
                        this.onBleSwitchDialogConfirm();
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 35, col: 18 });
                a11.setController(this.bleSwitchDialogController);
                ViewPU.create(a11);
                let b11 = () => {
                    return {
                        confirm: () => {
                            this.onBleSwitchDialogConfirm();
                        }
                    };
                };
                a11.paramsGenerator_ = b11;
            },
            alignment: DialogAlignment.Bottom
        }, this);
        this.jumpToSettingDialogController = new CustomDialogController({
            builder: () => {
                let y10 = new JumpToSettingDialog(this, {
                    confirm: () => {
                        this.onJumpToSettingDialogConfirm();
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 43, col: 18 });
                y10.setController(this.jumpToSettingDialogController);
                ViewPU.create(y10);
                let z10 = () => {
                    return {
                        confirm: () => {
                            this.onJumpToSettingDialogConfirm();
                        }
                    };
                };
                y10.paramsGenerator_ = z10;
            },
            alignment: DialogAlignment.Bottom
        }, this);
        this.setInitiallyProvidedValue(t10);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(r10: Index_Params) {
        if (r10.bleItemList !== undefined) {
            this.bleItemList = r10.bleItemList;
        }
        if (r10.bleScanning !== undefined) {
            this.bleScanning = r10.bleScanning;
        }
        if (r10.scanTimer !== undefined) {
            this.scanTimer = r10.scanTimer;
        }
        if (r10.bleAuthorizeDialogController !== undefined) {
            this.bleAuthorizeDialogController = r10.bleAuthorizeDialogController;
        }
        if (r10.bleSwitchDialogController !== undefined) {
            this.bleSwitchDialogController = r10.bleSwitchDialogController;
        }
        if (r10.jumpToSettingDialogController !== undefined) {
            this.jumpToSettingDialogController = r10.jumpToSettingDialogController;
        }
    }
    updateStateVars(q10: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(p10) {
        this.__bleItemList.purgeDependencyOnElmtId(p10);
        this.__bleScanning.purgeDependencyOnElmtId(p10);
    }
    aboutToBeDeleted() {
        this.__bleItemList.aboutToBeDeleted();
        this.__bleScanning.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __bleItemList: ObservedPropertyObjectPU<Array<BleDevice>>;
    get bleItemList() {
        return this.__bleItemList.get();
    }
    set bleItemList(o10: Array<BleDevice>) {
        this.__bleItemList.set(o10);
    }
    private __bleScanning: ObservedPropertySimplePU<boolean>;
    get bleScanning() {
        return this.__bleScanning.get();
    }
    set bleScanning(n10: boolean) {
        this.__bleScanning.set(n10);
    }
    private scanTimer;
    private bleAuthorizeDialogController: CustomDialogController;
    private bleSwitchDialogController: CustomDialogController;
    private jumpToSettingDialogController: CustomDialogController;
    onBleAuthorizeDialogConfirm() {
        askUserAuthorize(getContext(this) as common.UIAbilityContext, () => {
            this.onBleState(getBleState());
        }, () => {
        }, () => {
            this.jumpToSettingDialogController.open();
        });
    }
    onBleSwitchDialogConfirm() {
        enableBle(() => {
            this.startScan();
        });
    }
    onJumpToSettingDialogConfirm() {
        jumpToSetting(getContext() as common.UIAbilityContext);
    }
    stopScan() {
        this.bleScanning = false;
        stopBleScan();
        if (this.scanTimer > 0) {
            clearTimeout(this.scanTimer);
            this.scanTimer = -1;
        }
    }
    onPageHide() {
        this.stopScan();
    }
    onPageShow() {
        this.bleItemList = [];
    }
    startScan() {
        this.bleScanning = true;
        startBleScan((j10: Array<BleDevice>) => {
            j10.forEach(k10 => {
                let l10 = this.bleItemList.find(m10 => m10.name == k10.name);
                if (l10) {
                    l10.rssi = k10.rssi;
                }
                else {
                    this.bleItemList.push({
                        name: k10.name,
                        rssi: k10.rssi,
                        macAddress: k10.macAddress
                    });
                }
            });
        });
        this.scanTimer = setTimeout(() => {
            this.stopScan();
        }, 20 * 1000);
    }
    onBleState(i10: access.BluetoothState) {
        if (i10 == access.BluetoothState.STATE_OFF) {
            this.bleSwitchDialogController.open();
        }
        else if (i10 === access.BluetoothState.STATE_ON) {
            this.startScan();
        }
    }
    onGetGrantStatus(h10: abilityAccessCtrl.GrantStatus) {
        if (h10 === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED) {
            this.onBleState(getBleState());
        }
        else if (h10 === abilityAccessCtrl.GrantStatus.PERMISSION_DENIED) {
            this.bleAuthorizeDialogController.open();
        }
    }
    initialRender() {
        this.observeComponentCreation2((f10, g10) => {
            Column.create();
            Column.padding({ top: 30, bottom: 50 });
            Column.height('100%');
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((d10, e10) => {
            Flex.create({
                direction: FlexDirection.Row,
                alignItems: ItemAlign.Auto,
                justifyContent: FlexAlign.SpaceAround
            });
        }, Flex);
        this.observeComponentCreation2((b10, c10) => {
            Button.createWithLabel("开始扫描");
            Button.onClick(async () => {
                if (this.bleScanning) {
                    return;
                }
                this.onGetGrantStatus(await getGrantStatus());
            });
            Button.enabled(!this.bleScanning);
        }, Button);
        Button.pop();
        Flex.pop();
        this.observeComponentCreation2((z9, a10) => {
            List.create();
            List.width("90%");
            List.backgroundColor("#ff93deff");
            List.margin({ top: 30 });
            List.height("90%");
        }, List);
        this.observeComponentCreation2((b9, c9) => {
            ForEach.create();
            const d9 = f9 => {
                const g9 = f9;
                {
                    const h9 = (x9, y9) => {
                        ViewStackProcessor.StartGetAccessRecordingFor(x9);
                        ListItem.create(j9, true);
                        if (!y9) {
                            ListItem.pop();
                        }
                        ViewStackProcessor.StopGetAccessRecording();
                    };
                    const i9 = (u9, v9) => {
                        ListItem.create(j9, true);
                        ListItem.onClick(() => {
                            this.stopScan();
                            router.pushUrl({
                                url: 'pages/Device',
                                params: g9
                            }, w9 => {
                                if (w9) {
                                    console.error(`Invoke pushUrl failed, code is ${w9.code}, message is ${w9.message}`);
                                    return;
                                }
                            });
                        });
                        ListItem.margin(10);
                        ListItem.padding(15);
                        ListItem.border({ width: 1, color: Color.Black });
                    };
                    const j9 = (k9, l9) => {
                        h9(k9, l9);
                        this.observeComponentCreation2((s9, t9) => {
                            Row.create();
                            Row.width('100%');
                            Row.justifyContent(FlexAlign.SpaceBetween);
                        }, Row);
                        this.observeComponentCreation2((q9, r9) => {
                            Text.create(g9.name.length > 0 ? g9.name : "noname");
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((o9, p9) => {
                            Text.create(g9.rssi.toString());
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((m9, n9) => {
                            Text.create(g9.macAddress);
                            Text.fontSize(8);
                        }, Text);
                        Text.pop();
                        Row.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(i9, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(b9, this.bleItemList, d9, (e9: BleDevice) => `${e9.macAddress}${e9.rssi}`, false, false);
        }, ForEach);
        ForEach.pop();
        List.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.endy.blehelper", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
