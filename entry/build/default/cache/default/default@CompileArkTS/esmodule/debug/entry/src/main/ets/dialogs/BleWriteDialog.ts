if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BleWriteDialog_Params {
    cancel?: Function;
    confirm?: Function;
    controller?: CustomDialogController;
    sentValue?;
}
export class BleWriteDialog extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.cancel = undefined;
        this.confirm = undefined;
        this.controller = undefined;
        this.sentValue = "";
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: BleWriteDialog_Params) {
        if (params.cancel !== undefined) {
            this.cancel = params.cancel;
        }
        if (params.confirm !== undefined) {
            this.confirm = params.confirm;
        }
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.sentValue !== undefined) {
            this.sentValue = params.sentValue;
        }
    }
    updateStateVars(params: BleWriteDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private cancel?: Function;
    private confirm?: Function;
    private controller: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private sentValue;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.backgroundColor(Color.White);
            Column.padding({ top: 30, bottom: 30 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: "请输入16进制字符串" });
            TextInput.onChange((value: string) => {
                this.sentValue = value;
            });
            TextInput.margin({ left: 20, right: 20 });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ justifyContent: FlexAlign.SpaceAround });
            Flex.margin({ top: 20 });
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('关闭');
            Button.onClick(() => {
                this.controller.close();
                if (this.cancel) {
                    this.cancel();
                }
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('发送');
            Button.onClick(async () => {
                this.controller.close();
                if (this.confirm) {
                    await this.confirm(this.sentValue);
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
