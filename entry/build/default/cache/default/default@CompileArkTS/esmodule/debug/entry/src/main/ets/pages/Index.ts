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
import { askUserAuthorize, enableBle, getBleState, getGrantStatus, jumpToSetting, startBleScan, stopBleScan } from "@bundle:com.amdm.newble/entry/ets/ble/helper";
import type { BleDevice } from "@bundle:com.amdm.newble/entry/ets/ble/helper";
import { JumpToSettingDialog } from "@bundle:com.amdm.newble/entry/ets/dialogs/JumpToSettingDialog";
import { BleAuthorizeDialog } from "@bundle:com.amdm.newble/entry/ets/dialogs/BleAuthorizeDialog";
import { BleSwitchDialog } from "@bundle:com.amdm.newble/entry/ets/dialogs/BleSwitchDialog";
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__bleItemList = new ObservedPropertyObjectPU([], this, "bleItemList");
        this.__bleScanning = new ObservedPropertySimplePU(false, this, "bleScanning");
        this.scanTimer = -1;
        this.bleAuthorizeDialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new BleAuthorizeDialog(this, {
                    confirm: () => {
                        //用户点击去授权，拉起系统授权
                        this.onBleAuthorizeDialogConfirm();
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 26, col: 14 });
                jsDialog.setController(this.bleAuthorizeDialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        confirm: () => {
                            //用户点击去授权，拉起系统授权
                            this.onBleAuthorizeDialogConfirm();
                        }
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            alignment: DialogAlignment.Bottom
        }, this);
        this.bleSwitchDialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new BleSwitchDialog(this, {
                    confirm: () => {
                        this.onBleSwitchDialogConfirm();
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 35, col: 14 });
                jsDialog.setController(this.bleSwitchDialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        confirm: () => {
                            this.onBleSwitchDialogConfirm();
                        }
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            alignment: DialogAlignment.Bottom
        }, this);
        this.jumpToSettingDialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new JumpToSettingDialog(this, {
                    confirm: () => {
                        this.onJumpToSettingDialogConfirm();
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 43, col: 14 });
                jsDialog.setController(this.jumpToSettingDialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        confirm: () => {
                            this.onJumpToSettingDialogConfirm();
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
    setInitiallyProvidedValue(params: Index_Params) {
        if (params.bleItemList !== undefined) {
            this.bleItemList = params.bleItemList;
        }
        if (params.bleScanning !== undefined) {
            this.bleScanning = params.bleScanning;
        }
        if (params.scanTimer !== undefined) {
            this.scanTimer = params.scanTimer;
        }
        if (params.bleAuthorizeDialogController !== undefined) {
            this.bleAuthorizeDialogController = params.bleAuthorizeDialogController;
        }
        if (params.bleSwitchDialogController !== undefined) {
            this.bleSwitchDialogController = params.bleSwitchDialogController;
        }
        if (params.jumpToSettingDialogController !== undefined) {
            this.jumpToSettingDialogController = params.jumpToSettingDialogController;
        }
    }
    updateStateVars(params: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__bleItemList.purgeDependencyOnElmtId(rmElmtId);
        this.__bleScanning.purgeDependencyOnElmtId(rmElmtId);
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
    set bleItemList(newValue: Array<BleDevice>) {
        this.__bleItemList.set(newValue);
    }
    private __bleScanning: ObservedPropertySimplePU<boolean>;
    get bleScanning() {
        return this.__bleScanning.get();
    }
    set bleScanning(newValue: boolean) {
        this.__bleScanning.set(newValue);
    }
    private scanTimer;
    private bleAuthorizeDialogController: CustomDialogController;
    private bleSwitchDialogController: CustomDialogController;
    private jumpToSettingDialogController: CustomDialogController;
    onBleAuthorizeDialogConfirm() {
        askUserAuthorize(getContext(this) as common.UIAbilityContext, () => {
            //用户同意
            this.onBleState(getBleState());
        }, () => {
            // 弹窗了，用户没有同意，这里不作处理
        }, () => {
            // 没有弹窗，用户已经拒绝过了
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
    // 退出页面的时候必须停止搜索关闭定时器，防止空指针问题
    onPageHide() {
        this.stopScan();
    }
    onPageShow() {
        this.bleItemList = [];
    }
    //搜索入口
    startScan() {
        this.bleScanning = true;
        startBleScan((bleDeviceList: Array<BleDevice>) => {
            // index维护了一份蓝牙设备列表
            // helper传过来的蓝牙设备列表需要对比，如果已在列表中只需要更新rssi，否则需要添加进列表中
            bleDeviceList.forEach(bleDevice => {
                // if (bleDevice.name.length > 0 && bleDevice.name.startsWith("BT401")) {
                if (bleDevice.name.length > 0) {
                    let foundDevice = this.bleItemList.find(item => item.name == bleDevice.name);
                    if (foundDevice) {
                        foundDevice.rssi = bleDevice.rssi;
                    }
                    else {
                        this.bleItemList.push({
                            name: bleDevice.name,
                            rssi: bleDevice.rssi,
                            macAddress: bleDevice.macAddress
                        });
                    }
                }
            });
        });
        // 20秒后关闭搜索
        this.scanTimer = setTimeout(() => {
            this.stopScan();
        }, 20 * 1000);
    }
    onBleState(bleState: access.BluetoothState) {
        if (bleState == access.BluetoothState.STATE_OFF) {
            //打开窗口提示打开蓝牙
            this.bleSwitchDialogController.open();
        }
        else if (bleState === access.BluetoothState.STATE_ON) {
            //开始扫描
            this.startScan();
        }
    }
    onGetGrantStatus(grantStatus: abilityAccessCtrl.GrantStatus) {
        if (grantStatus === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED) {
            // 已经授权，查询蓝牙开关状态
            this.onBleState(getBleState());
        }
        else if (grantStatus === abilityAccessCtrl.GrantStatus.PERMISSION_DENIED) {
            // 未授权，弹出授权提示窗
            this.bleAuthorizeDialogController.open();
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.padding({ top: 10, bottom: 20 });
            Column.height('100%');
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('搜索设备');
            Text.fontSize(22);
            Text.fontColor({ "id": 16777256, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("开始扫描");
            Button.onClick(async () => {
                if (this.bleScanning) {
                    return;
                }
                this.onGetGrantStatus(await getGrantStatus());
            });
            Button.backgroundColor("#F0F7FF");
            Button.padding(12);
            Button.borderRadius(24);
            Button.fontColor({ "id": 16777256, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
            Button.fontSize(16);
            Button.enabled(!this.bleScanning);
            Button.borderRadius(20);
            Button.width(200);
            Button.height(40);
            Button.padding({
                left: 20,
                right: 20,
            });
            Button.margin({
                top: 15
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create();
            List.width("90%");
            List.margin({ top: 20 });
            List.height("90%");
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const item = _item;
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
                        ListItem.onClick(() => {
                            this.stopScan();
                            router.pushUrl({
                                url: 'pages/BleControl',
                                // url: 'pages/TabSwitchExample',
                                params: item
                            }, err => {
                                if (err) {
                                    console.error(`Invoke pushUrl failed, code is ${err.code}, message is ${err.message}`);
                                    return;
                                }
                            });
                        });
                    };
                    const deepRenderFunction = (elmtId, isInitialRender) => {
                        itemCreation(elmtId, isInitialRender);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Row.create();
                            Row.backgroundColor("#F0F7FF");
                            Row.padding({
                                left: 14,
                                right: 14
                            });
                            Row.margin({ top: 10 });
                            Row.width('100%');
                            Row.height(50);
                            Row.justifyContent(FlexAlign.SpaceBetween);
                            Row.borderRadius(10);
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            if (item.name.length > 0) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.name);
                                        Text.fontSize(16);
                                    }, Text);
                                    Text.pop();
                                });
                            }
                            // Text(item.rssi.toString()).fontSize(8)
                            else {
                                this.ifElseBranchUpdateFunction(1, () => {
                                });
                            }
                        }, If);
                        If.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            // Text(item.rssi.toString()).fontSize(8)
                            Text.create(item.macAddress);
                            // Text(item.rssi.toString()).fontSize(8)
                            Text.fontSize(8);
                        }, Text);
                        // Text(item.rssi.toString()).fontSize(8)
                        Text.pop();
                        Row.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.bleItemList, forEachItemGenFunction, (item: BleDevice) => `${item.macAddress}${item.rssi}`, false, false);
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
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.amdm.newble", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
