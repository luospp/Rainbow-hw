
@Component
export struct BleButton {

  @Prop buttonText: ResourceStr = '';
  @Prop icon: Resource;
  @Prop textColor?: ResourceColor = $r('app.color.colorAccent');
  private onButtonClick?: () => void

  @State isPressed: boolean = false;
  @State bgSize: number = 50;
  @State defaultColor: string = '#EEF1FD';
  @State pressedColor: string = '#E4E9FB';

  @Builder
  createButton() {
    Column({ space: 8 }) {
      Column() {
        Image(this.icon).width(20).height(20)
      }
      .width(this.bgSize)
      .height(this.bgSize)
      .backgroundColor(this.isPressed ? this.pressedColor : this.defaultColor)
      .borderRadius(this.bgSize / 2)
      .justifyContent(FlexAlign.Center)
      .alignItems(HorizontalAlign.Center)
      .onClick(() => {
        this.onButtonClick
      })
      .onTouch((event: TouchEvent) => {
        if (event.type === TouchType.Down) {
          this.isPressed = true;
        } else if ([TouchType.Up, TouchType.Cancel].includes(event.type)) {
          this.isPressed = false;
        }
      });

      Text(this.buttonText)
        .fontSize(12)
        .fontColor(this.textColor);
    }
  }

  build() {
    this.createButton();
  }
}