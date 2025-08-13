import { router } from '@kit.ArkUI'
import { ble } from '@kit.ConnectivityKit'
import {
    BleDevice,
    connectToDevice,
    disconnectDevice,
    getShortUUID,
    readCharacteristic,
    subscribeCharacteristic,
    writeCharacteristic
} from '../ble/helper'
import { BleWriteDialog } from '../dialogs/BleWriteDialog'

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
struct Device {
    @State bleName: string = "Gi888888"
    @State macAddress: string = "00:00:00:00:00:00"
    @State deviceLog: string = ""
    @State serviceList: BleService[]=[]

    // 在编写界面的时候，可以解开这一段调试界面样式
    // @State serviceList: BleService[] = [{
    //     uuid: "AAAA",
    //     characteristicList: [{
    //         uuid: "BBBB",
    //         read: true,
    //         notify: true,
    //         write: true
    //     }, { uuid: "CCCC", write: true }]
    // }, {
    //     uuid: "AAAA",
    //     characteristicList: [{ uuid: "BBBB", read: true, notify: true }, { uuid: "CCCC", write: true }]
    // }, {
    //     uuid: "AAAA",
    //     characteristicList: [{ uuid: "BBBB", read: true, notify: true }, { uuid: "CCCC", write: true }]
    // }, {
    //     uuid: "AAAA",
    //     characteristicList: [{ uuid: "BBBB", read: true, notify: true }, { uuid: "CCCC", write: true }]
    // }]


    private characteristicReadyToWrite: string = ""

    onBleWriteDialogConfirm(sentValue: string) {
        // console.log(sentValue)
        this.writeBle(this.characteristicReadyToWrite, sentValue)
    }

    bleWriteDialogController: CustomDialogController = new CustomDialogController({
        builder: BleWriteDialog({
            confirm: (sentValue: string) => {
                this.onBleWriteDialogConfirm(sentValue)
            }
        }),
        alignment: DialogAlignment.Bottom
    })

    appendLog(logText: string) {
        this.deviceLog = logText + "\n" + this.deviceLog
    }

    aboutToAppear(): void {
        this.bleName = (router.getParams() as BleDevice)?.name || this.bleName
        this.macAddress = (router.getParams() as BleDevice)?.macAddress || this.macAddress

        connectToDevice(this.macAddress, () => {
            this.appendLog(`${this.bleName} connected`)
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
        router.back({
            url: 'pages/Index'
        })
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

    writeBle(shortUUID: string, writeValue: string) {
        this.appendLog(`write ${shortUUID}: ${writeValue}`)
        writeCharacteristic(shortUUID, writeValue)
    }

   async  readBle(shortUUID: string) {
        let result =await  readCharacteristic(shortUUID)
        this.appendLog(`read ${shortUUID}: ${result}`)
    }

    subscribeBle(shortUUID: string) {
        this.appendLog(`subscribe ${shortUUID}`)
        subscribeCharacteristic(shortUUID)
    }

    build() {
        Column() {
            Row() {
                Text(this.bleName)
                Blank()
                Text(this.macAddress)
            }
            .padding({ left: 15, right: 15 })
            .width("100%")
            .height("10%")

            List({ space: 10 }) {
                ForEach(this.serviceList, (service: BleService) => {
                    ListItemGroup({ header: this.serviceHead(service.uuid) }) {
                        ForEach(service.characteristicList, (characteristic: BleCharacteristic) => {
                            ListItem() {
                                Row() {
                                    Text(characteristic.uuid)
                                    Blank()
                                    Flex({
                                        direction: FlexDirection.Row,
                                        alignItems: ItemAlign.Auto,
                                        justifyContent: FlexAlign.SpaceAround
                                    }) {
                                        if (characteristic.write) {
                                            Button("写", { type: ButtonType.Circle })
                                                .fontSize(13)
                                                .padding(5)
                                                .onClick(() => {
                                                    this.characteristicReadyToWrite = characteristic.uuid
                                                    this.bleWriteDialogController.open()
                                                })
                                        }
                                        if (characteristic.read) {
                                            Button("读", { type: ButtonType.Circle })
                                                .fontSize(13)
                                                .padding(5)
                                                .onClick(async() => {
                                                    await this.readBle(characteristic.uuid)
                                                })
                                        }
                                        if (characteristic.notify) {
                                            Button("通", { type: ButtonType.Circle })
                                                .fontSize(13)
                                                .padding(5)
                                                .onClick(() => {
                                                    this.subscribeBle(characteristic.uuid)
                                                })
                                        }

                                    }.width("50%")
                                }.width("90%").padding(8)
                            }.width("100%")
                        }
                        )
                    }
                    .divider({
                        strokeWidth: 1,
                        color: Color.Gray,
                        startMargin: 10,
                        endMargin: 10
                    })
                })
            }.padding({ left: 10, right: 10 })
            .width("100%")
            .height("50%")

            Blank()

            TextArea({ text: this.deviceLog })
                .padding(10)
                .width("100%")
                .height('30%')
                .backgroundColor(Color.Transparent)
        }
        .height('100%')
        .width('100%')
    }
}