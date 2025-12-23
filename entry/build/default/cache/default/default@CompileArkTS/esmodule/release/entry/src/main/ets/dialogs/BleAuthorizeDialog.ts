if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BleAuthorizeDialog_Params {
    cancel?: Function;
    confirm?: Function;
    controller?: CustomDialogController;
}
export class BleAuthorizeDialog extends ViewPU {
    constructor(t2, u2, v2, w2 = -1, x2 = undefined, y2) {
        super(t2, v2, w2, y2);
        if (typeof x2 === "function") {
            this.paramsGenerator_ = x2;
        }
        this.cancel = undefined;
        this.confirm = undefined;
        this.controller = undefined;
        this.setInitiallyProvidedValue(u2);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(s2: BleAuthorizeDialog_Params) {
        if (s2.cancel !== undefined) {
            this.cancel = s2.cancel;
        }
        if (s2.confirm !== undefined) {
            this.confirm = s2.confirm;
        }
        if (s2.controller !== undefined) {
            this.controller = s2.controller;
        }
    }
    updateStateVars(r2: BleAuthorizeDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(q2) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private cancel?: Function;
    private confirm?: Function;
    private controller: CustomDialogController;
    setController(p2: CustomDialogController) {
        this.controller = p2;
    }
    initialRender() {
        this.observeComponentCreation2((n2, o2) => {
            Column.create();
            Column.backgroundColor(Color.White);
            Column.padding({ top: 30, bottom: 30 });
        }, Column);
        this.observeComponentCreation2((l2, m2) => {
            Text.create("请授权APP获取蓝牙权限以建立蓝牙连接");
        }, Text);
        Text.pop();
        this.observeComponentCreation2((j2, k2) => {
            Flex.create({ justifyContent: FlexAlign.SpaceAround });
            Flex.margin({ top: 20 });
        }, Flex);
        this.observeComponentCreation2((h2, i2) => {
            Button.createWithLabel('关闭');
            Button.onClick(() => {
                this.controller.close();
                if (this.cancel) {
                    this.cancel();
                }
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((f2, g2) => {
            Button.createWithLabel('去授权');
            Button.onClick(async () => {
                this.controller.close();
                if (this.confirm) {
                    await this.confirm();
                }
            });
        }, Button);
        Button.pop();
        Flex.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
