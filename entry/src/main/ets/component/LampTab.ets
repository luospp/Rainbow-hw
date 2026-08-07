@Component
export struct LampTab {
  @State currentIndex: number = 0
  private tabs: string[] = ['灯光模式', '音乐模式']
  private onTabSelected?: (position: number) => void
  @Prop initialIndex: number = 0

  aboutToAppear() {
    if (this.initialIndex !== undefined) {
      this.currentIndex = this.initialIndex
    }
  }

  build() {
    Row({ space: 0 }) {
      ForEach(this.tabs, (item: string, index: number) => {
        this.buildTabItem(index)
      })
    }
    .width('100%')
    .height(45)
    .backgroundColor('#EEF1FD') // 未选中颜色
    .borderRadius(30)
    .padding(2)
  }

  @Builder
  buildTabItem(index: number) {
    Row() {
      // 图标
      Image(this.getIcon(index))
        .width(20)
        .height(20)
        .margin({ right: 8 })
        .objectFit(ImageFit.Contain)
        .foregroundColor(this.currentIndex === index ? Color.White : '#333333')


      // 文字
      Text(this.tabs[index])
        .fontSize(14)
        .fontWeight(this.currentIndex === index ? FontWeight.Medium : FontWeight.Normal)
        .fontColor(this.currentIndex === index ? '#FFFFFF' : '#333333') // 选中白色，未选中深灰色
    }
    .justifyContent(FlexAlign.Center)
    .alignItems(VerticalAlign.Center)
    .layoutWeight(1)
    .height('100%')
    .backgroundColor(this.currentIndex === index ? '#5975EF' : 'transparent') // 选中蓝色，未选中透明
    .borderRadius(this.getBorderRadius(index))
    .onClick(() => {
      this.currentIndex = index
      this.onTabSelected?.(index)
    })
  }

  // 获取图标资源
  private getIcons(index: number): Resource {
    if (index === 0) {
      // 灯光模式图标（灯泡）
      // 这里使用系统图标，实际项目中可以替换为自定义图标
      return $r('app.media.tab_lamp') // 需要添加对应的图片资源
    } else {
      // 音乐模式图标
      return $r('app.media.tab_music') // 需要添加对应的图片资源
    }
  }

  // 获取图标资源，根据选中状态返回不同颜色的图标
  private getIcon(index: number): Resource {

    const isSelected = this.currentIndex == index

    if (index === 0) {
      // 灯光模式图标
      return isSelected ? $r('app.media.tab_lamp_selected') : $r('app.media.tab_lamp')
    } else {
      // 音乐模式图标
      return isSelected ? $r('app.media.tab_music_selected') : $r('app.media.tab_music')
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
        }
      } else if (index === 1) {
        // 右侧选项：左侧直角，右侧圆角
        return {
          topLeft: 0,
          topRight: 30,
          bottomLeft: 0,
          bottomRight: 30
        }
      }
    }
    return {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0
    }
  }
}