import { App, router } from '@kit.ArkUI';
import { ble } from '@kit.ConnectivityKit';
import { LogUtil } from '../utils/LogUtils';
import {
  BleDevice,
  connectToDevice,
  disconnectDevice,
  getShortUUID,
  readCharacteristic,
  subscribeCharacteristic,
  writeLightCharacteristic,
  writeMusicCharacteristic
} from '../ble/helper';
import { BleWriteDialog } from '../dialogs/BleWriteDialog';
import { LampTab } from '../component/LampTab';
import { BleButton } from './BleButton';

interface BleService {
  uuid: string
  characteristicList: BleCharacteristic[]
}

interface BleCharacteristic {
  uuid: string
  write?: boolean
  notify?: boolean
  read?: boolean
}

@Entry
@Component
struct BleControl {
  @State macAddress: string = "00:00:00:00:00:00"
  @State deviceLog: string = ""
  @State serviceList: BleService[] = []
  @State currentTab: number = 0; // 0: 灯光, 1: 音乐
  @State connectFlag: number = 0; // 连接状态 ：1 未连接、2 连接成功 3、连接失败
  @State cBrightness: number = 0;
  @State colorTemp: number = 0;
  @State volume: number = 0;
  @State switchFlag: boolean = false
  bleWriteDialogController: CustomDialogController = new CustomDialogController({
    builder: BleWriteDialog({
      confirm: (sentValue: string) => {
        this.sendMusicOrder(sentValue)
      }
    }),
    alignment: DialogAlignment.Bottom
  })

  appendLog(logText: string) {
    this.deviceLog = logText + "\n" + this.deviceLog
    // LogUtil.d(this.deviceLog)
  }

  aboutToAppear(): void {
    this.macAddress = (router.getParams() as BleDevice)?.macAddress || this.macAddress

    connectToDevice(this.macAddress, () => {
      this.connectFlag = 2

    }, () => {
      //断开返回
      this.onBackPress()
    }, (serviceList: Array<ble.GattService>) => {
      this.serviceList = []
      serviceList.forEach(service => {
        let serviceItem: BleService = { uuid: getShortUUID(service.serviceUuid), characteristicList: [] }
        service.characteristics.forEach(characteristic => {
          let properties = characteristic.properties
          let characteristicItem: BleCharacteristic =
            {
              uuid: getShortUUID(characteristic.characteristicUuid),
              write: properties?.write || properties?.writeNoResponse,
              read: properties?.read,
              notify: properties?.notify
            }
          serviceItem.characteristicList.push(characteristicItem)
        })
        this.serviceList.push(serviceItem)
      })
    }, (shortUUID: string, characteristicValue: string) => {
      this.appendLog(`${shortUUID} notify: ${characteristicValue}`)
    })
  }

  aboutToDisappear() {
    disconnectDevice()
  }

  onBackPress(): boolean | void {

    const options: router.RouterOptions = {
      url: 'pages/Index', // 如果需要返回指定页面则保留
      params: { key: 'value' } // 传递需要的参数
    };
    router.back(options)

    return true
  }

  @Builder
  serviceHead(text: string) {
    Text(text)
      .width("100%")
      .backgroundColor("#ff5f74ff")
      .padding(10)
      .borderRadius(5)
      .fontColor(Color.White)
  }

  async readBle(shortUUID: string) {
    let result = await readCharacteristic(shortUUID)
    this.appendLog(`read ${shortUUID}: ${result}`)
  }

  subscribeBle(shortUUID: string) {
    this.appendLog(`subscribe ${shortUUID}`)
    subscribeCharacteristic("FFF1")
  }

  sendMusicOrder(order: string) {
    const str = "AT+" + order
    writeMusicCharacteristic(str)
    this.appendLog(`write FFF3: ${str}`)
    LogUtil.d(str)
  }

  sendLightOrder(type: string, value: string) {

    let data = ["[", type, value, "]"]
    writeLightCharacteristic(data)
    this.appendLog(`write FFF3: ${data}`)
    LogUtil.d(data.toString())
  }

  connectStr(): string {
    let state = ""
    switch (this.connectFlag) {
      case 1: {
        state = "正在连接"
      }
      case 2: {
        state = "蓝牙已连接"
      }
    }
    return state
  }

  connectColor(): ResourceColor {
    let color: ResourceColor = $r('app.color.connecting')
    switch (this.connectFlag) {
      case 1: {
        color = $r('app.color.connecting')
      }
      case 2: {
        color = $r('app.color.colorAccent')
      }
      // case 3: {
      //   color = $r('app.color.disconnected')
      // }
    }
    LogUtil.d("蓝牙连接状态：" + this.connectFlag)
    return color
  }

  build() {
    Column() {
      // 顶部图片区域
      Stack({ alignContent: Alignment.TopStart }) {
        // 背景图片
        Image($r('app.media.top_img'))
          .width('100%')
          .height(240)
          .objectFit(ImageFit.Cover)
          .backgroundColor(Color.Black)

        // 顶部内容
        Column({ space: 0 }) {
          // 第一行：Logo和连接状态
          Row({ space: 0 }) {
            // Logo
            Image($r('app.media.top_logo'))
              .width(80)
              .height(21)
              .margin({ left: 16 }).align(Alignment.Start)
            Blank()
            // 连接状态
            Text(this.connectStr())
              .constraintSize({ minWidth: 80 })
              .height(20)
              .fontSize(12)
              .textAlign(TextAlign.Center)
              .fontColor(Color.White)
              .backgroundColor(this.connectColor())
              .borderRadius(10)
              .padding({
                left: 6,
                right: 6,
                top: 2,
                bottom: 2
              })
              .margin({ right: 14 })

            // 设置按钮
            Image($r('app.media.iv_setting'))
              .width(15)
              .height(15)
              .margin({ right: 14 })
              .opacity(0.7)
              .onClick(() => {
                // 跳转到设置页面
                LogUtil.d("打开设置界面")
                this.bleWriteDialogController.open()

              })
          }
          .width('100%').margin({ top: 26 })
          .justifyContent(FlexAlign.Start)


          // 主标题和副标题
          Column() {
            Text($r('app.string.primary_name'))
              .fontSize(30)
              .fontColor(Color.White)
              .margin({ top: 20 })

            Text($r('app.string.sub_name'))
              .fontSize(20)
              .fontColor(Color.White)
              .margin({ top: 10 })
          }
          .alignItems(HorizontalAlign.Start)
          .margin({ left: 16, top: 20 })
          .align(Alignment.Start)
        }.alignItems(HorizontalAlign.Start)
      }
      .width('100%')
      .height(240)


      // 主内容区域
      Column({ space: 0 }) {
        Column({ space: 0 }) {
          // Tab切换
          LampTab({
            // 传递回调函数
            onTabSelected: (index: number) => {
              this.currentTab = index;
            }
          })


          // 根据当前Tab显示不同内容
          if (this.currentTab === 0) {
            // 灯光控制
            this.LightControlView()
          } else {
            // 音乐控制
            this.MusicControlView()
          }
        }
        .backgroundColor($r('app.color.white'))
        .borderRadius(20)
        .padding(20)
        .margin({ left: 18, right: 18, top: -29 })

        // 滑块控制区域
        if (this.currentTab === 0) {
          this.LightSeekbarView()
        } else {
          this.MusicSeekbarView()
        }
      }
      .width('100%').margin({ top: 10 })

      // 日志
      // TextArea({ text: this.deviceLog })
      //   .padding(10)
      //   .width("100%")
      //   .height('30%')
      //   .backgroundColor(Color.Transparent)
    }
    .height('100%')
    .width('100%').backgroundColor($r('app.color.background'))
  }

  // 灯光控制视图
  @Builder
  LightControlView() {
    Column() {
      // 开关和方向控制行
      Row() {
        // 开关按钮
        BleButton({
          buttonText: $r('app.string.on_off'),
          icon: $r('app.media.iv_switch_normal'),
          textColor: $r('app.color.mainTone'),
          onButtonClick: () => {
            // 开关控制
            const order = this.switchFlag ? "0x00" : "0x01"
            this.switchFlag = !this.switchFlag
            this.sendLightOrder("T", order)
          }
        }).margin({ right: 36, top: 10 })


        // 方向控制
        Column({ space: 0 }) {
          Row() {
            // 向上
            Column({ space: 8 }) {
              Column() {
                Image($r('app.media.iv_up_normal'))
                  .width(20)
                  .height(20)
              }
              .width(44)
              .height(44)
              .backgroundColor($r('app.color.circle_bg'))
              .borderRadius(22)
              .justifyContent(FlexAlign.Center)
              .alignItems(HorizontalAlign.Center)
              .onClick(() => {
                // 向上控制
                this.sendLightOrder("E", "0x01")
              })

              Text($r('app.string.up'))
                .fontSize(12)
                .fontColor($r('app.color.main_tone')).margin({ top: 6 })
            }.margin({ left: 15 })

            // 停止
            Column({ space: 8 }) {
              Column() {
                Image($r('app.media.iv_play_normal'))
                  .width(20)
                  .height(20)
              }
              .width(44)
              .height(44)
              .backgroundColor($r('app.color.circle_bg'))
              .borderRadius(22)
              .justifyContent(FlexAlign.Center)
              .alignItems(HorizontalAlign.Center)
              .onClick(() => {
                // 停止控制
                this.sendLightOrder("E", "0x00")
              })

              Text($r('app.string.stop'))
                .fontSize(12)
                .fontColor($r('app.color.main_tone')).margin({ top: 6 })
            }

            // 向下
            Column({ space: 8 }) {
              Column() {
                Image($r('app.media.iv_down_normal'))
                  .width(20)
                  .height(20)
              }
              .width(44)
              .height(44)
              .backgroundColor($r('app.color.circle_bg'))
              .borderRadius(22)
              .justifyContent(FlexAlign.Center)
              .alignItems(HorizontalAlign.Center)
              .onClick(() => {
                // 向下控制
                this.sendLightOrder("E", "0x02");
              })

              Text($r('app.string.down'))
                .fontSize(12)
                .fontColor($r('app.color.main_tone')).margin({ top: 6 })
            }.margin({ right: 15 })
          }.margin({ top: 3 })
          .width('100%')
          .justifyContent(FlexAlign.SpaceBetween).alignItems(VerticalAlign.Center)
        }
        .backgroundColor($r('app.color.content_bg'))
        .borderRadius(30)
        .height(50)
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Center)
      }
      .width
      (
        '100%'
      )

      // 模式选择
      Column({ space: 10 }) {
        Row({ space: 0 }) {
          // 唤醒模式
          Column({ space: 8 }) {
            Column() {
              Image($r('app.media.iv_wake'))
                .objectFit(ImageFit.Fill)
                .width(19)
                .height(19)
            }
            .width(50)
            .height(50)
            .backgroundColor($r('app.color.circle_bg'))
            .borderRadius(50)
            .justifyContent(FlexAlign.Center)
            .alignItems(HorizontalAlign.Center)
            .onClick(() => {
              // 唤醒模式
              this.sendLightOrder("M", "0x01")
            })

            Text($r('app.string.wake_mode'))
              .fontSize(12)
              .fontColor($r('app.color.colorAccent')).margin({ top: 6 })
          }


          // 工作模式
          Column({ space: 8 }) {
            Column() {
              Image($r('app.media.iv_work'))
                .objectFit(ImageFit.Fill)
                .width(22)
                .height(18)
            }
            .width(50)
            .height(50)
            .backgroundColor($r('app.color.circle_bg'))
            .borderRadius(50)
            .justifyContent(FlexAlign.Center)
            .alignItems(HorizontalAlign.Center)
            .onClick(() => {
              // 工作模式
              this.sendLightOrder("M", "0x03")
            })

            Text($r('app.string.work_mode'))
              .fontSize(12)
              .fontColor($r('app.color.colorAccent')).margin({ top: 6 })
          }

          // 健康模式
          Column({ space: 8 }) {
            Column() {
              Image($r('app.media.iv_health'))
                .objectFit(ImageFit.Fill)
                .width(16)
                .height(19)
            }
            .width(50)
            .height(50)
            .backgroundColor($r('app.color.circle_bg'))
            .borderRadius(50)
            .justifyContent(FlexAlign.Center)
            .alignItems(HorizontalAlign.Center)
            .onClick(() => {
              // 健康模式
              this.sendLightOrder("M", "0x04")
            })

            Text($r('app.string.health_mode'))
              .fontSize(12)
              .fontColor($r('app.color.colorAccent')).margin({ top: 6 })
          }

          // 睡眠模式
          Column({ space: 8 }) {
            Column() {
              Image($r('app.media.iv_sleep'))
                .objectFit(ImageFit.Fill)
                .width(21)
                .height(17)
            }
            .width(50)
            .height(50)
            .backgroundColor($r('app.color.circle_bg'))
            .borderRadius(50)
            .justifyContent(FlexAlign.Center)
            .alignItems(HorizontalAlign.Center)
            .onClick(() => {
              // 睡眠模式
              this.sendLightOrder("M", "0x02")
            })

            Text($r('app.string.sleep_mode'))
              .fontSize(12)
              .fontColor($r('app.color.colorAccent')).margin({ top: 6 })
          }
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
      }
      .width
      (
        '100%'
      )
      .margin({ top: 22 })
    }
    .width('100%')
  }

  // 音乐控制视图
  @Builder
  MusicControlView() {
    Column({ space: 0 }) {
      // 音乐播放控制
      Column({ space: 8 }) {
        Row({ space: 28 }) {
          // 上一首
          Column({ space: 8 }) {
            Column() {
              Image($r('app.media.iv_pre_normal'))
                .width(20)
                .height(20)
            }
            .width(44)
            .height(44)
            .backgroundColor($r('app.color.circle_bg'))
            .borderRadius(22)
            .justifyContent(FlexAlign.Center)
            .alignItems(HorizontalAlign.Center)
            .onClick(() => {
              // 上一首
              this.sendMusicOrder("CC")

            })

            Text($r('app.string.pre_song'))
              .fontSize(12)
              .fontColor($r('app.color.main_tone')).margin({ top: 10 })
          }.margin({ left: 28 })

          // 播放/暂停
          Column({ space: 8 }) {
            Column() {
              Image($r('app.media.iv_play_normal'))
                .width(24)
                .height(24)
            }
            .width(44)
            .height(44)
            .backgroundColor($r('app.color.circle_bg'))
            .borderRadius(22)
            .justifyContent(FlexAlign.Center)
            .alignItems(HorizontalAlign.Center)
            .onClick(() => {
              // 播放/暂停
              this.sendMusicOrder("CB")
            })

            Text($r('app.string.play'))
              .fontSize(12)
              .fontColor($r('app.color.main_tone')).margin({ top: 10 })
          }

          // 下一首
          Column({ space: 8 }) {
            Column() {
              Image($r('app.media.iv_next_normal'))
                .width(20)
                .height(20)
            }
            .width(44)
            .height(44)
            .backgroundColor($r('app.color.circle_bg'))
            .borderRadius(22)
            .justifyContent(FlexAlign.Center)
            .alignItems(HorizontalAlign.Center)
            .onClick(() => {
              // 下一首
              this.sendMusicOrder("CD")
            })

            Text($r('app.string.next_song'))
              .fontSize(12)
              .fontColor($r('app.color.main_tone')).margin({ top: 10 })
          }.margin({ right: 28 })
        }
        .width('100%').margin({ top: 3 })
        .justifyContent(FlexAlign.SpaceBetween)
      }
      .backgroundColor($r('app.color.content_bg'))
      .borderRadius(30)
      .height(50)
      .width('100%')
      .margin({ top: 20 })

      // 音乐模式选择
      Column({ space: 10 }) {
        Row({ space: 0 }) {
          // 列表循环
          Column({ space: 8 }) {
            Column() {
              Image($r('app.media.iv_list_loop'))
                .objectFit(ImageFit.Fill)
                .width(17)
                .height(18)
            }
            .width(50)
            .height(50)
            .backgroundColor($r('app.color.circle_bg'))
            .borderRadius(50)
            .justifyContent(FlexAlign.Center)
            .alignItems(HorizontalAlign.Center)
            .onClick(() => {
              // 列表循环
              this.sendMusicOrder("AC00")
            })

            Text($r('app.string.list_loop'))
              .fontSize(12)
              .fontColor($r('app.color.colorAccent')).margin({ top: 6 })
          }

          // 单曲循环
          Column({ space: 8 }) {
            Column() {
              Image($r('app.media.iv_single_loop'))
                .objectFit(ImageFit.Fill)
                .width(19)
                .height(18)
            }
            .width(50)
            .height(50)
            .backgroundColor($r('app.color.circle_bg'))
            .borderRadius(50)
            .justifyContent(FlexAlign.Center)
            .alignItems(HorizontalAlign.Center)
            .onClick(() => {
              // 单曲循环
              this.sendMusicOrder("AC02")
            })

            Text($r('app.string.single_loop'))
              .fontSize(12)
              .fontColor($r('app.color.colorAccent')).margin({ top: 6 })
          }

          // 本地模式
          Column({ space: 8 }) {
            Column() {
              Image($r('app.media.iv_local_mode'))
                .objectFit(ImageFit.Fill)
                .width(14)
                .height(18)
            }
            .width(50)
            .height(50)
            .backgroundColor($r('app.color.circle_bg'))
            .borderRadius(50)
            .justifyContent(FlexAlign.Center)
            .alignItems(HorizontalAlign.Center)
            .onClick(() => {
              // 本地模式
              this.sendMusicOrder("CM03")
            })

            Text($r('app.string.local_mode'))
              .fontSize(12)
              .fontColor($r('app.color.colorAccent')).margin({ top: 6 })
          }

          // BLE模式
          Column({ space: 8 }) {
            Column() {
              Image($r('app.media.iv_ble_mode'))
                .objectFit(ImageFit.Fill)
                .width(14)
                .height(18)
            }
            .width(50)
            .height(50)
            .backgroundColor($r('app.color.circle_bg'))
            .borderRadius(50)
            .justifyContent(FlexAlign.Center)
            .alignItems(HorizontalAlign.Center)
            .onClick(() => {
              // BLE模式
              this.sendMusicOrder("CM01")

            })

            Text($r('app.string.ble_mode'))
              .fontSize(12)
              .fontColor($r('app.color.colorAccent')).margin({ top: 6 })
          }
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .margin({ top: 20 })
      }.margin({ top: 30 })
      .width('100%')
    }
    .width('100%')
  }

  // 灯光滑块视图
  @Builder
  LightSeekbarView() {
    Column() {
      // 亮度控制
      Row() {
        Column() {
          Image($r('app.media.iv_dimmer')).objectFit(ImageFit.Fill)
            .width(20)
            .height(16)
        }
        .width(50)
        .height(50)
        .backgroundColor($r('app.color.circle_bg'))
        .borderRadius(50)
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)

        Column() {
          Row() {
            Text($r('app.string.dimmer'))
              .fontSize(14)
              .fontColor($r('app.color.main_tone'))
              .margin({ left: 14, top: 35 })
            Blank()

            Text(`${this.cBrightness} %`)
              .fontSize(14)
              .fontColor($r('app.color.main_tone')).margin({ top: 35 })
          }
          .width('100%')

          Slider({
            value: this.cBrightness,
            min: 0,
            max: 100,
            step: 1,
            style: SliderStyle.OutSet
          })
            .width('100%')
            .margin({ bottom: 20 })
            .onTouch((touch: TouchEvent) => {
              if (touch.type == TouchType.Up) {
                // 发送亮度控制命令
                const cValue = this.cBrightness.toString(16).toUpperCase()
                this.sendLightOrder("P", cValue)
              }
            })
            .onChange((value: number) => {
              this.cBrightness = value;
            })
        }
        .layoutWeight(1)
        .margin({ left: 10 })
      }

      // 色温控制
      Row({ space: 0 }) {
        Column() {
          Image($r('app.media.iv_temp_color')).objectFit(ImageFit.Fill)
            .width(19)
            .height(16)
        }
        .width(50)
        .height(50)
        .backgroundColor($r('app.color.circle_bg'))
        .borderRadius(50)
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)

        Column() {
          Row() {
            Text($r('app.string.color_temperature'))
              .fontSize(14)
              .fontColor($r('app.color.main_tone1'))
              .margin({ left: 14, top: 35 })
            Blank()
            Text(this.getColorTempText(this.colorTemp))
              .fontSize(14)
              .fontColor($r('app.color.main_tone1'))
              .margin({ right: 20, top: 35 })
          }
          .width('100%')

          Slider({
            value: this.colorTemp,
            min: 0,
            max: 100,
            step: 1,
            style: SliderStyle.OutSet
          })
            .trackColor(new LinearGradient([
              { color: '#E45106', offset: 0.0 },
              { color: '#E48735', offset: 0.5 },
              { color: '#5975EF', offset: 1.0 }
            ]))
            .width('100%')
            .margin({ bottom: 20 })
            .onTouch((touch: TouchEvent) => {
              if (touch.type == TouchType.Up) {
                // 发送亮度控制命令
                const cValue = this.cBrightness.toString(16).toUpperCase()
                this.sendLightOrder("C", cValue)
              }
            })
            .onChange((value: number) => {
              this.colorTemp = value;
            })
        }
        .layoutWeight(1)
        .margin({ left: 10 })
      }
    }
    .backgroundColor($r('app.color.white'))
    .borderRadius(20)
    .padding({
      left: 20,
      right: 20,
    })
    .margin({ top: 17, left: 18, right: 18 })
  }

  // 音乐滑块视图
  @Builder
  MusicSeekbarView() {
    Column() {
      Row() {
        Column() {
          Image($r('app.media.iv_speaker_normal')).objectFit(ImageFit.Fill)
            .width(17)
            .height(13)
        }
        .width(50)
        .height(50)
        .backgroundColor($r('app.color.circle_bg'))
        .borderRadius(50)
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)

        Column({ space: 0 }) {
          Row({ space: 0 }) {
            Text($r('app.string.volume'))
              .fontSize(12)
              .fontColor($r('app.color.main_tone'))
              .margin({ left: 10, top: 35 })
            Blank()
            Text(this.volume.toString())
              .fontSize(12)
              .fontColor($r('app.color.main_tone'))
              .margin({ top: 35 })
          }
          .width('100%')

          Slider({
            value: this.volume,
            min: 0,
            max: 30,
            step: 1,
            style: SliderStyle.OutSet
          })
            .width('100%')
            .margin({ bottom: 20, left: 30, right: 20 })
            .onTouch((touch: TouchEvent) => {
              if (touch.type == TouchType.Up) {
                // 发送音量控制命令
                // this.sendMusicOrder("CA" + this.volume)

                this.onStopTrackingTouch(this.volume)
              }
            })
            .onChange((value: number) => {
              this.volume = value;
            })
        }
        .layoutWeight(1)
      }
    }
    .backgroundColor($r('app.color.white'))
    .borderRadius(20)
    .padding({
      left: 20,
      right: 20,
    })
    .alignItems(HorizontalAlign.Center)
    .justifyContent(FlexAlign.Center)
    .margin({ top: 16, left: 16, right: 16 })
  }

  // 首先，在组件中定义相关的状态变量
  @State tempVolume: number = 5 // 临时音量值，默认10

  onStopTrackingTouch(progress: number) {
    if (progress !== undefined && progress !== null) {


      // 大于10直接发数字
      if (progress >= 10) {
        this.sendMusicOrder("CA" + progress)
        this.tempVolume = progress
      } else {

        if (this.tempVolume > 10) {
          this.sendMusicOrder("CA10")
          this.tempVolume = 10
        }

        if (this.tempVolume === 10 || this.tempVolume > progress) {
          const vSub = this.tempVolume - progress
          this.handVolume(vSub, progress, "CF")
        } else if (this.tempVolume < progress) {
          const vSub = progress - this.tempVolume
          this.handVolume(vSub, progress, "CE")
        }
      }
    }
  }

  private async handVolume(vSub: number, progress: number, order: string): Promise<void> {
    // 创建一个异步任务来模拟Kotlin的lifecycleScope.launch(Dispatchers.IO)
    for (let i = 0; i < vSub; i++) {
      // 延迟500毫秒，对应delay(Duration.ofMillis(500))
      await this.delay(500)
      this.sendMusicOrder(order)
    }
    // 更新临时音量值
    this.tempVolume = progress
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      // 使用setTimeout实现延迟
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }

  // 获取色温文本描述
  private getColorTempTextss(value: number): string {

    return "冷色"
  }

  private getColorTempText(progress: number): string {
    // 对应 Kotlin 中的 when 语句，使用 TypeScript switch/if-else 实现分支判断
    if (progress >= 0 && progress <= 30) {
      return "温暖";
    } else if (progress >= 31 && progress <= 50) {
      return "温暖";
    } else if (progress >= 51 && progress <= 70) {
      return "白光";
    } else if (progress >= 71 && progress <= 100) {
      return "冷白";
    } else {
      return "温暖";
    }

  }
}