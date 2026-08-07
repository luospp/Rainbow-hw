import { access } from '@kit.ConnectivityKit'
import { abilityAccessCtrl, common } from '@kit.AbilityKit'
import { router } from '@kit.ArkUI'
import {
  askUserAuthorize,
  BleDevice,
  enableBle,
  getBleState,
  getGrantStatus,
  jumpToSetting,
  startBleScan,
  stopBleScan
} from '../ble/helper'

import { JumpToSettingDialog } from '../dialogs/JumpToSettingDialog'
import { BleAuthorizeDialog } from '../dialogs/BleAuthorizeDialog'
import { BleSwitchDialog } from '../dialogs/BleSwitchDialog'

@Entry
@Component
struct Index {
  @State bleItemList: Array<BleDevice> = []
  @State bleScanning: boolean = false
  private scanTimer = -1
  bleAuthorizeDialogController: CustomDialogController = new CustomDialogController({
    builder: BleAuthorizeDialog({
      confirm: () => {
        //用户点击去授权，拉起系统授权
        this.onBleAuthorizeDialogConfirm()
      }
    }),
    alignment: DialogAlignment.Bottom
  })
  bleSwitchDialogController: CustomDialogController = new CustomDialogController({
    builder: BleSwitchDialog({
      confirm: () => {
        this.onBleSwitchDialogConfirm()
      }
    }),
    alignment: DialogAlignment.Bottom
  })
  jumpToSettingDialogController: CustomDialogController = new CustomDialogController({
    builder: JumpToSettingDialog({
      confirm: () => {
        this.onJumpToSettingDialogConfirm()
      }
    }),
    alignment: DialogAlignment.Bottom
  })

  onBleAuthorizeDialogConfirm() {
    askUserAuthorize(getContext(this) as common.UIAbilityContext, () => {
      //用户同意
      this.onBleState(getBleState())
    }, () => {
      // 弹窗了，用户没有同意，这里不作处理

    }, () => {
      // 没有弹窗，用户已经拒绝过了
      this.jumpToSettingDialogController.open()
    })
  }

  onBleSwitchDialogConfirm() {
    enableBle(() => {
      this.startScan()
    })
  }

  onJumpToSettingDialogConfirm() {
    jumpToSetting(getContext() as common.UIAbilityContext)
  }

  stopScan() {
    this.bleScanning = false
    stopBleScan()
    if (this.scanTimer > 0) {
      clearTimeout(this.scanTimer)
      this.scanTimer = -1
    }
  }

  // 退出页面的时候必须停止搜索关闭定时器，防止空指针问题
  onPageHide() {
    this.stopScan()
  }

  onPageShow() {
    this.bleItemList = []
  }

  //搜索入口
  startScan() {
    this.bleScanning = true
    startBleScan((bleDeviceList: Array<BleDevice>) => {
      // index维护了一份蓝牙设备列表
      // helper传过来的蓝牙设备列表需要对比，如果已在列表中只需要更新rssi，否则需要添加进列表中
      bleDeviceList.forEach(bleDevice => {

        // if (bleDevice.name.length > 0 && bleDevice.name.startsWith("BT401")) {
        if (bleDevice.name.length > 0) {
          let foundDevice = this.bleItemList.find(item => item.name == bleDevice.name)
          if (foundDevice) {
            foundDevice.rssi = bleDevice.rssi
          } else {
            this.bleItemList.push({
              name: bleDevice.name,
              rssi: bleDevice.rssi,
              macAddress: bleDevice.macAddress
            })
          }
        }
      })

    })
    // 20秒后关闭搜索
    this.scanTimer = setTimeout(() => {
      this.stopScan()
    }, 20 * 1000)
  }

  onBleState(bleState: access.BluetoothState) {
    if (bleState == access.BluetoothState.STATE_OFF) {
      //打开窗口提示打开蓝牙
      this.bleSwitchDialogController.open()
    } else if (bleState === access.BluetoothState.STATE_ON) {
      //开始扫描
      this.startScan()
    }
  }

  onGetGrantStatus(grantStatus: abilityAccessCtrl.GrantStatus) {
    if (grantStatus === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED) {
      // 已经授权，查询蓝牙开关状态
      this.onBleState(getBleState())
    } else if (grantStatus === abilityAccessCtrl.GrantStatus.PERMISSION_DENIED) {
      // 未授权，弹出授权提示窗
      this.bleAuthorizeDialogController.open()
    }
  }

  build() {
    Column() {
      Text('搜索设备').fontSize(22).fontColor($r('app.color.mainTone'))

      Button("开始扫描")
        .onClick(async () => {
          if (this.bleScanning) {
            return
          }
          this.onGetGrantStatus(await getGrantStatus())
        })
        .backgroundColor("#F0F7FF")
        .padding(12)
        .borderRadius(24)
        .fontColor($r('app.color.mainTone'))
        .fontSize(16)
        .enabled(!this.bleScanning)
        .borderRadius(20)
        .width(200)
        .height(40)
        .padding({
          left: 20,
          right: 20,
        })
        .margin({
          top: 15
        })

      List() {
        ForEach(this.bleItemList, (item: BleDevice) => {
          ListItem() {
            Row() {
              if (item.name.length > 0) {
                Text(item.name).fontSize(16)
              }
              // Text(item.rssi.toString()).fontSize(8)
              Text(item.macAddress).fontSize(8)
            }
            .backgroundColor("#F0F7FF")
            .padding({
              left: 14,
              right: 14
            })
            .margin({ top: 10 })
            .width('100%')
            .height(50)
            .justifyContent(FlexAlign.SpaceBetween)
            .borderRadius(10)
          }
          .onClick(() => {
            this.stopScan()
            router.pushUrl({
              url: 'pages/BleControl',
              // url: 'pages/TabSwitchExample',
              params: item
            }, err => {
              if (err) {
                console.error(`Invoke pushUrl failed, code is ${err.code}, message is ${err.message}`)
                return
              }
            })
          })
        }, (item: BleDevice) => `${item.macAddress}${item.rssi}`)
      }.width("90%").margin({ top: 20 }).height("90%")
    }
    .padding({ top: 10, bottom: 20 })
    .height('100%')
    .width('100%')
  }
}