if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BleSwitchDialog_Params {
    cancel?: Function;
    confirm?: Function;
    controller?: CustomDialogController;
}
export class BleSwitchDialog extends ViewPU {
    constructor(n3, o3, p3, q3 = -1, r3 = undefined, s3) {
        super(n3, p3, q3, s3);
        if (typeof r3 === "function") {
            this.paramsGenerator_ = r3;
        }
        this.cancel = undefined;
        this.confirm = undefined;
        this.controller = undefined;
        this.setInitiallyProvidedValue(o3);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(m3: BleSwitchDialog_Params) {
        if (m3.cancel !== undefined) {
            this.cancel = m3.cancel;
        }
        if (m3.confirm !== undefined) {
            this.confirm = m3.confirm;
        }
        if (m3.controller !== undefined) {
            this.controller = m3.controller;
        }
    }
    updateStateVars(l3: BleSwitchDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(k3) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private cancel?: Function;
    private confirm?: Function;
    private controller: CustomDialogController;
    setController(j3: CustomDialogController) {
        this.controller = j3;
    }
    initialRender() {
        this.observeComponentCreation2((h3, i3) => {
            Column.create();
            Column.backgroundColor(Color.White);
            Column.padding({ top: 30, bottom: 30 });
        }, Column);
        this.observeComponentCreation2((f3, g3) => {
            Text.create("请打开蓝牙开关");
        }, Text);
        Text.pop();
        this.observeComponentCreation2((d3, e3) => {
            Flex.create({ justifyContent: FlexAlign.SpaceAround });
            Flex.margin({ top: 20 });
        }, Flex);
        this.observeComponentCreation2((b3, c3) => {
            Button.createWithLabel('关闭');
            Button.onClick(() => {
                this.controller.close();
                if (this.cancel) {
                    this.cancel();
                }
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((z2, a3) => {
            Button.createWithLabel('去打开');
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
