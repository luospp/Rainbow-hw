if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BleButton_Params {
    buttonText?: ResourceStr;
    icon?: Resource;
    textColor?: ResourceColor;
    onButtonClick?: () => void;
    isPressed?: boolean;
    bgSize?: number;
    defaultColor?: string;
    pressedColor?: string;
}
export class BleButton extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__buttonText = new SynchedPropertyObjectOneWayPU(params.buttonText, this, "buttonText");
        this.__icon = new SynchedPropertyObjectOneWayPU(params.icon, this, "icon");
        this.__textColor = new SynchedPropertyObjectOneWayPU(params.textColor, this, "textColor");
        this.onButtonClick = undefined;
        this.__isPressed = new ObservedPropertySimplePU(false, this, "isPressed");
        this.__bgSize = new ObservedPropertySimplePU(50, this, "bgSize");
        this.__defaultColor = new ObservedPropertySimplePU('#EEF1FD', this, "defaultColor");
        this.__pressedColor = new ObservedPropertySimplePU('#E4E9FB', this, "pressedColor");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: BleButton_Params) {
        if (params.buttonText === undefined) {
            this.__buttonText.set('');
        }
        if (params.textColor === undefined) {
            this.__textColor.set({ "id": 16777252, "type": 10001, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" });
        }
        if (params.onButtonClick !== undefined) {
            this.onButtonClick = params.onButtonClick;
        }
        if (params.isPressed !== undefined) {
            this.isPressed = params.isPressed;
        }
        if (params.bgSize !== undefined) {
            this.bgSize = params.bgSize;
        }
        if (params.defaultColor !== undefined) {
            this.defaultColor = params.defaultColor;
        }
        if (params.pressedColor !== undefined) {
            this.pressedColor = params.pressedColor;
        }
    }
    updateStateVars(params: BleButton_Params) {
        this.__buttonText.reset(params.buttonText);
        this.__icon.reset(params.icon);
        this.__textColor.reset(params.textColor);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__buttonText.purgeDependencyOnElmtId(rmElmtId);
        this.__icon.purgeDependencyOnElmtId(rmElmtId);
        this.__textColor.purgeDependencyOnElmtId(rmElmtId);
        this.__isPressed.purgeDependencyOnElmtId(rmElmtId);
        this.__bgSize.purgeDependencyOnElmtId(rmElmtId);
        this.__defaultColor.purgeDependencyOnElmtId(rmElmtId);
        this.__pressedColor.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__buttonText.aboutToBeDeleted();
        this.__icon.aboutToBeDeleted();
        this.__textColor.aboutToBeDeleted();
        this.__isPressed.aboutToBeDeleted();
        this.__bgSize.aboutToBeDeleted();
        this.__defaultColor.aboutToBeDeleted();
        this.__pressedColor.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __buttonText: SynchedPropertySimpleOneWayPU<ResourceStr>;
    get buttonText() {
        return this.__buttonText.get();
    }
    set buttonText(newValue: ResourceStr) {
        this.__buttonText.set(newValue);
    }
    private __icon: SynchedPropertySimpleOneWayPU<Resource>;
    get icon() {
        return this.__icon.get();
    }
    set icon(newValue: Resource) {
        this.__icon.set(newValue);
    }
    private __textColor?: SynchedPropertySimpleOneWayPU<ResourceColor>;
    get textColor() {
        return this.__textColor.get();
    }
    set textColor(newValue: ResourceColor) {
        this.__textColor.set(newValue);
    }
    private onButtonClick?: () => void;
    private __isPressed: ObservedPropertySimplePU<boolean>;
    get isPressed() {
        return this.__isPressed.get();
    }
    set isPressed(newValue: boolean) {
        this.__isPressed.set(newValue);
    }
    private __bgSize: ObservedPropertySimplePU<number>;
    get bgSize() {
        return this.__bgSize.get();
    }
    set bgSize(newValue: number) {
        this.__bgSize.set(newValue);
    }
    private __defaultColor: ObservedPropertySimplePU<string>;
    get defaultColor() {
        return this.__defaultColor.get();
    }
    set defaultColor(newValue: string) {
        this.__defaultColor.set(newValue);
    }
    private __pressedColor: ObservedPropertySimplePU<string>;
    get pressedColor() {
        return this.__pressedColor.get();
    }
    set pressedColor(newValue: string) {
        this.__pressedColor.set(newValue);
    }
    createButton(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(this.bgSize);
            Column.height(this.bgSize);
            Column.backgroundColor(this.isPressed ? this.pressedColor : this.defaultColor);
            Column.borderRadius(this.bgSize / 2);
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.onClick(() => {
                this.onButtonClick;
            });
            Column.onTouch((event: TouchEvent) => {
                if (event.type === TouchType.Down) {
                    this.isPressed = true;
                }
                else if ([TouchType.Up, TouchType.Cancel].includes(event.type)) {
                    this.isPressed = false;
                }
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create(this.icon);
            Image.width(20);
            Image.height(20);
        }, Image);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.buttonText);
            Text.fontSize(12);
            Text.fontColor(ObservedObject.GetRawObject(this.textColor));
        }, Text);
        Text.pop();
        Column.pop();
    }
    initialRender() {
        this.createButton.bind(this)();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
