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
    constructor(i4, j4, k4, l4 = -1, m4 = undefined, n4) {
        super(i4, k4, l4, n4);
        if (typeof m4 === "function") {
            this.paramsGenerator_ = m4;
        }
        this.cancel = undefined;
        this.confirm = undefined;
        this.controller = undefined;
        this.sentValue = "";
        this.setInitiallyProvidedValue(j4);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(h4: BleWriteDialog_Params) {
        if (h4.cancel !== undefined) {
            this.cancel = h4.cancel;
        }
        if (h4.confirm !== undefined) {
            this.confirm = h4.confirm;
        }
        if (h4.controller !== undefined) {
            this.controller = h4.controller;
        }
        if (h4.sentValue !== undefined) {
            this.sentValue = h4.sentValue;
        }
    }
    updateStateVars(g4: BleWriteDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(f4) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private cancel?: Function;
    private confirm?: Function;
    private controller: CustomDialogController;
    setController(e4: CustomDialogController) {
        this.controller = e4;
    }
    private sentValue;
    initialRender() {
        this.observeComponentCreation2((c4, d4) => {
            Column.create();
            Column.backgroundColor(Color.White);
            Column.padding({ top: 30, bottom: 30 });
        }, Column);
        this.observeComponentCreation2((z3, a4) => {
            TextInput.create({ placeholder: "请输入16进制字符串" });
            TextInput.onChange((b4: string) => {
                this.sentValue = b4;
            });
            TextInput.margin({ left: 20, right: 20 });
        }, TextInput);
        this.observeComponentCreation2((x3, y3) => {
            Flex.create({ justifyContent: FlexAlign.SpaceAround });
            Flex.margin({ top: 20 });
        }, Flex);
        this.observeComponentCreation2((v3, w3) => {
            Button.createWithLabel('关闭');
            Button.onClick(() => {
                this.controller.close();
                if (this.cancel) {
                    this.cancel();
                }
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((t3, u3) => {
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
