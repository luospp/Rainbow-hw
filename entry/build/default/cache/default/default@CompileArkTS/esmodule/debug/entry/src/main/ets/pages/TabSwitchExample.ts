if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface TabSwitchExample_Params {
}
import { BleButton } from "@bundle:com.amdm.newble/entry/ets/pages/BleButton";
class TabSwitchExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: TabSwitchExample_Params) {
    }
    updateStateVars(params: TabSwitchExample_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题
            Text.create('模式选择');
            // 标题
            Text.fontSize(24);
            // 标题
            Text.fontWeight(FontWeight.Bold);
            // 标题
            Text.margin({ top: 40, bottom: 30 });
        }, Text);
        // 标题
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            __Common__.create();
            __Common__.margin({ top: 30 });
        }, __Common__);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new BleButton(this, {
                        buttonText: '开关',
                        icon: { "id": 16777300, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" },
                        onButtonClick: () => {
                            console.log('开关按钮被点击！');
                        }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/TabSwitchExample.ets", line: 17, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            buttonText: '开关',
                            icon: { "id": 16777300, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" },
                            onButtonClick: () => {
                                console.log('开关按钮被点击！');
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        buttonText: '开关',
                        icon: { "id": 16777300, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" }
                    });
                }
            }, { name: "BleButton" });
        }
        __Common__.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "TabSwitchExample";
    }
}
registerNamedRoute(() => new TabSwitchExample(undefined, {}), "", { bundleName: "com.amdm.newble", moduleName: "entry", pagePath: "pages/TabSwitchExample", pageFullPath: "entry/src/main/ets/pages/TabSwitchExample", integratedHsp: "false", moduleType: "followWithHap" });
