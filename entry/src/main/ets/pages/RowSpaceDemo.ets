@Entry
@Component
struct RowSpaceDemo {
  build() {
    Column({ space: 20 }) {
      Text("Row({ space: 0 }) 效果（无间距）")
        .fontSize(16)
        .textAlign(TextAlign.Center);

      // space: 0，子元素之间无水平间距
      Row({ space: 0 }) {
        Text("子元素1")
          .backgroundColor("#00B42A")
          .fontColor("#FFFFFF")
          .padding(8)
          .borderRadius(4);
        Text("子元素2")
          .backgroundColor("#1890FF")
          .fontColor("#FFFFFF")
          .padding(8)
          .borderRadius(4);
        Text("子元素3")
          .backgroundColor("#FF4D4F")
          .fontColor("#FFFFFF")
          .padding(8)
          .borderRadius(4);
      }
      .width("80%")
      .backgroundColor("#F5F5F5")
      .padding(10)
      .borderRadius(6);

      Text("Row({ space: 15 }) 效果（15间距）")
        .fontSize(16)
        .textAlign(TextAlign.Center).margin({ top: 20 });

      // space: 0，子元素之间无水平间距
      Row({ space: 15 }) {
        Text("子元素1")
          .backgroundColor("#00B42A")
          .fontColor("#FFFFFF")
          .padding(8)
          .borderRadius(4);
        Text("子元素2")
          .backgroundColor("#1890FF")
          .fontColor("#FFFFFF")
          .padding(8)
          .borderRadius(4);
        Text("子元素3")
          .backgroundColor("#FF4D4F")
          .fontColor("#FFFFFF")
          .padding(8)
          .borderRadius(4);
      }
      .width("80%")
      .backgroundColor("#F5F5F5")
      .padding(10)
      .borderRadius(6);

      Text("justifyContent: FlexAlign.Center（Row 水平居中）")
        .fontSize(14);
      Row() {
        Text("子1").backgroundColor("#00B42A").padding(8);
        Text("子2").backgroundColor("#1890FF").padding(8);
      }
      .width("80%")
      .height(60)
      .backgroundColor("#F5F5F5")
      .justifyContent(FlexAlign.Center); // 主轴（水平）居中

      Text("justifyContent: FlexAlign.SpaceBetween（Row 两端对齐）")
        .fontSize(14);
      Row() {
        Text("子1").backgroundColor("#00B42A").padding(8);
        Text("子2").backgroundColor("#1890FF").padding(8);
      }
      .width("80%")
      .height(60)
      .backgroundColor("#F5F5F5")
      .justifyContent(FlexAlign.SpaceEvenly); // 主轴（水平）两端对齐

      // 根结点
    }
    .width("100%")
    .height("100%")
    .padding(20)
    .backgroundColor("#FFFFFF");
  }
}