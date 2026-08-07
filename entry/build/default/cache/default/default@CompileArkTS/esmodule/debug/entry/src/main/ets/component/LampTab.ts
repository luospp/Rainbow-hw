if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface LampTab_Params {
    currentIndex?: number;
    tabs?: string[];
    onTabSelected?: (position: number) => void;
    initialIndex?: number;
}
export class LampTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__currentIndex = new ObservedPropertySimplePU(0, this, "currentIndex");
        this.tabs = ['灯光模式', '音乐模式'];
        this.onTabSelected = undefined;
        this.__initialIndex = new SynchedPropertySimpleOneWayPU(params.initialIndex, this, "initialIndex");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: LampTab_Params) {
        if (params.currentIndex !== undefined) {
            this.currentIndex = params.currentIndex;
        }
        if (params.tabs !== undefined) {
            this.tabs = params.tabs;
        }
        if (params.onTabSelected !== undefined) {
            this.onTabSelected = params.onTabSelected;
        }
        if (params.initialIndex === undefined) {
            this.__initialIndex.set(0);
        }
    }
    updateStateVars(params: LampTab_Params) {
        this.__initialIndex.reset(params.initialIndex);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__currentIndex.purgeDependencyOnElmtId(rmElmtId);
        this.__initialIndex.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__currentIndex.aboutToBeDeleted();
        this.__initialIndex.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __currentIndex: ObservedPropertySimplePU<number>;
    get currentIndex() {
        return this.__currentIndex.get();
    }
    set currentIndex(newValue: number) {
        this.__currentIndex.set(newValue);
    }
    private tabs: string[];
    private onTabSelected?: (position: number) => void;
    private __initialIndex: SynchedPropertySimpleOneWayPU<number>;
    get initialIndex() {
        return this.__initialIndex.get();
    }
    set initialIndex(newValue: number) {
        this.__initialIndex.set(newValue);
    }
    aboutToAppear() {
        if (this.initialIndex !== undefined) {
            this.currentIndex = this.initialIndex;
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 0 });
            Row.width('100%');
            Row.height(45);
            Row.backgroundColor('#EEF1FD');
            Row.borderRadius(30);
            Row.padding(2);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const item = _item;
                this.buildTabItem.bind(this)(index);
            };
            this.forEachUpdateFunction(elmtId, this.tabs, forEachItemGenFunction, undefined, true, false);
        }, ForEach);
        ForEach.pop();
        Row.pop();
    }
    buildTabItem(index: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.justifyContent(FlexAlign.Center);
            Row.alignItems(VerticalAlign.Center);
            Row.layoutWeight(1);
            Row.height('100%');
            Row.backgroundColor(this.currentIndex === index ? '#5975EF' : 'transparent');
            Row.borderRadius(this.getBorderRadius(index));
            Row.onClick(() => {
                this.currentIndex = index;
                this.onTabSelected?.(index);
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 图标
            Image.create(this.getIcon(index));
            // 图标
            Image.width(20);
            // 图标
            Image.height(20);
            // 图标
            Image.margin({ right: 8 });
            // 图标
            Image.objectFit(ImageFit.Contain);
            // 图标
            Image.foregroundColor(this.currentIndex === index ? Color.White : '#333333');
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 文字
            Text.create(this.tabs[index]);
            // 文字
            Text.fontSize(14);
            // 文字
            Text.fontWeight(this.currentIndex === index ? FontWeight.Medium : FontWeight.Normal);
            // 文字
            Text.fontColor(this.currentIndex === index ? '#FFFFFF' : '#333333');
        }, Text);
        // 文字
        Text.pop();
        Row.pop();
    }
    // 获取图标资源
    private getIcons(index: number): Resource {
        if (index === 0) {
            // 灯光模式图标（灯泡）
            // 这里使用系统图标，实际项目中可以替换为自定义图标
            return { "id": 16777319, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" }; // 需要添加对应的图片资源
        }
        else {
            // 音乐模式图标
            return { "id": 16777321, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" }; // 需要添加对应的图片资源
        }
    }
    // 获取图标资源，根据选中状态返回不同颜色的图标
    private getIcon(index: number): Resource {
        const isSelected = this.currentIndex == index;
        if (index === 0) {
            // 灯光模式图标
            return isSelected ? { "id": 16777320, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" } : { "id": 16777319, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" };
        }
        else {
            // 音乐模式图标
            return isSelected ? { "id": 16777322, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" } : { "id": 16777321, "type": 20000, params: [], "bundleName": "com.amdm.newble", "moduleName": "entry" };
        }
    }
    // 根据索引返回对应的圆角样式
    private getBorderRadius(index: number): BorderRadiuses {
        if (this.tabs.length === 2) {
            if (index === 0) {
                // 左侧选项：左侧圆角，右侧直角
                return {
                    topLeft: 30,
                    topRight: 0,
                    bottomLeft: 30,
                    bottomRight: 0
                };
            }
            else if (index === 1) {
                // 右侧选项：左侧直角，右侧圆角
                return {
                    topLeft: 0,
                    topRight: 30,
                    bottomLeft: 0,
                    bottomRight: 30
                };
            }
        }
        return {
            topLeft: 0,
            topRight: 0,
            bottomLeft: 0,
            bottomRight: 0
        };
    }
    rerender() {
        this.updateDirtyElements();
    }
}
