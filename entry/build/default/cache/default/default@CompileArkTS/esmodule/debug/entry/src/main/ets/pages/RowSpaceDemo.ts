if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface RowSpaceDemo_Params {
}
class RowSpaceDemo extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: RowSpaceDemo_Params) {
    }
    updateStateVars(params: RowSpaceDemo_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.width("100%");
            Column.height("100%");
            Column.padding(20);
            Column.backgroundColor("#FFFFFF");
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("Row({ space: 0 }) 效果（无间距）");
            Text.fontSize(16);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // space: 0，子元素之间无水平间距
            Row.create({ space: 0 });
            // space: 0，子元素之间无水平间距
            Row.width("80%");
            // space: 0，子元素之间无水平间距
            Row.backgroundColor("#F5F5F5");
            // space: 0，子元素之间无水平间距
            Row.padding(10);
            // space: 0，子元素之间无水平间距
            Row.borderRadius(6);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("子元素1");
            Text.backgroundColor("#00B42A");
            Text.fontColor("#FFFFFF");
            Text.padding(8);
            Text.borderRadius(4);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("子元素2");
            Text.backgroundColor("#1890FF");
            Text.fontColor("#FFFFFF");
            Text.padding(8);
            Text.borderRadius(4);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("子元素3");
            Text.backgroundColor("#FF4D4F");
            Text.fontColor("#FFFFFF");
            Text.padding(8);
            Text.borderRadius(4);
        }, Text);
        Text.pop();
        // space: 0，子元素之间无水平间距
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("Row({ space: 15 }) 效果（15间距）");
            Text.fontSize(16);
            Text.textAlign(TextAlign.Center);
            Text.margin({ top: 20 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // space: 0，子元素之间无水平间距
            Row.create({ space: 15 });
            // space: 0，子元素之间无水平间距
            Row.width("80%");
            // space: 0，子元素之间无水平间距
            Row.backgroundColor("#F5F5F5");
            // space: 0，子元素之间无水平间距
            Row.padding(10);
            // space: 0，子元素之间无水平间距
            Row.borderRadius(6);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("子元素1");
            Text.backgroundColor("#00B42A");
            Text.fontColor("#FFFFFF");
            Text.padding(8);
            Text.borderRadius(4);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("子元素2");
            Text.backgroundColor("#1890FF");
            Text.fontColor("#FFFFFF");
            Text.padding(8);
            Text.borderRadius(4);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("子元素3");
            Text.backgroundColor("#FF4D4F");
            Text.fontColor("#FFFFFF");
            Text.padding(8);
            Text.borderRadius(4);
        }, Text);
        Text.pop();
        // space: 0，子元素之间无水平间距
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("justifyContent: FlexAlign.Center（Row 水平居中）");
            Text.fontSize(14);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width("80%");
            Row.height(60);
            Row.backgroundColor("#F5F5F5");
            Row.justifyContent(FlexAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("子1");
            Text.backgroundColor("#00B42A");
            Text.padding(8);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("子2");
            Text.backgroundColor("#1890FF");
            Text.padding(8);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("justifyContent: FlexAlign.SpaceBetween（Row 两端对齐）");
            Text.fontSize(14);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width("80%");
            Row.height(60);
            Row.backgroundColor("#F5F5F5");
            Row.justifyContent(FlexAlign.SpaceEvenly);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("子1");
            Text.backgroundColor("#00B42A");
            Text.padding(8);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("子2");
            Text.backgroundColor("#1890FF");
            Text.padding(8);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "RowSpaceDemo";
    }
}
registerNamedRoute(() => new RowSpaceDemo(undefined, {}), "", { bundleName: "com.amdm.newble", moduleName: "entry", pagePath: "pages/RowSpaceDemo", pageFullPath: "entry/src/main/ets/pages/RowSpaceDemo", integratedHsp: "false", moduleType: "followWithHap" });
