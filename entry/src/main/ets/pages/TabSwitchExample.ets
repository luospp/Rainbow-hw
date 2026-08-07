// 使用示例 - 在Page中
import { LampTab } from '../component/LampTab'
import { BleButton } from './BleButton';


@Entry
@Component
struct TabSwitchExample {
  build() {
    Column() {
      // 标题
      Text('模式选择')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin({ top: 40, bottom: 30 })

      BleButton({
        buttonText: '开关',
        icon: $r('app.media.iv_switch_normal'),
        onButtonClick: () => {
          console.log('开关按钮被点击！');
        }
      }).margin({ top: 30 })
    }
    .width('100%')
    .height('100%')
    // .backgroundColor('#FFFFFF')
    .alignItems(HorizontalAlign.Center)
  }
}