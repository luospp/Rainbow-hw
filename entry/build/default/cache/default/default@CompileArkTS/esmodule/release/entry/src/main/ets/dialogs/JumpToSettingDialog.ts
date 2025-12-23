if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface JumpToSettingDialog_Params {
    cancel?: Function;
    confirm?: Function;
    controller?: CustomDialogController;
}
export class JumpToSettingDialog extends ViewPU {
    constructor(c5, d5, e5, f5 = -1, g5 = undefined, h5) {
        super(c5, e5, f5, h5);
        if (typeof g5 === "function") {
            this.paramsGenerator_ = g5;
        }
        this.cancel = undefined;
        this.confirm = undefined;
        this.controller = undefined;
        this.setInitiallyProvidedValue(d5);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(b5: JumpToSettingDialog_Params) {
        if (b5.cancel !== undefined) {
            this.cancel = b5.cancel;
        }
        if (b5.confirm !== undefined) {
            this.confirm = b5.confirm;
        }
        if (b5.controller !== undefined) {
            this.controller = b5.controller;
        }
    }
    updateStateVars(a5: JumpToSettingDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(z4) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private cancel?: Function;
    private confirm?: Function;
    private controller: CustomDialogController;
    setController(y4: CustomDialogController) {
        this.controller = y4;
    }
    aboutToAppear(): void {
        console.debug(`open JumpToSettingDialog`);
    }
    initialRender() {
        this.observeComponentCreation2((w4, x4) => {
            Column.create();
            Column.backgroundColor(Color.White);
            Column.padding({ top: 30, bottom: 30 });
        }, Column);
        this.observeComponentCreation2((u4, v4) => {
            Text.create('请在系统设置页面打开蓝牙授权');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((s4, t4) => {
            Flex.create({ justifyContent: FlexAlign.SpaceAround });
            Flex.margin({ top: 20 });
        }, Flex);
        this.observeComponentCreation2((q4, r4) => {
            Button.createWithLabel('关闭');
            Button.onClick(() => {
                this.controller.close();
                if (this.cancel) {
                    this.cancel();
                }
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((o4, p4) => {
            Button.createWithLabel('去设置');
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
