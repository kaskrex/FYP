import React, { Component } from 'react';
import {
     AppRegistry,
     Platform,
     PermissionsAndroid, // for checking if certain android permissions are enabled
     StyleSheet,
     Text,
     View,
     NativeEventEmitter, // for emitting events for the BLE manager
     NativeModules, // for getting an instance of the BLE manager module
     Button,
     ToastAndroid, // for showing notification if there's a new attendee
     FlatList, // for creating lists
     Alert,
     Image,
     ImageEditor,
     imageURL,
     ImageStore
} from 'react-native';
import { BleManager, Characteristic } from 'react-native-ble-plx';
import { stringToBytes } from 'convert-string'; // for converting string to byte array
import RandomId from 'random-id'; // for generating random user ID
import bytesCounter from 'bytes-counter'; // for getting the number of bytes in a string
import Spinner from 'react-native-spinkit'; // for showing a spinner when loading something
import { Buffer } from 'buffer';
import ImgToBase64 from 'react-native-image-base64';
import firebase from 'firebase';
import RNFetchBlob from 'react-native-fetch-blob';
//import RNImageConverter from 'react-native-image-converter';
import { Base64 } from 'js-base64';
//import base64Img from 'base64-img';
//import Prompt from 'react-native-prompt'; // for showing an input prompt

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class App extends Component {

  constructor() {
    super();
    this.manager = new BleManager()
    this.state = {
      is_scanning: false, // whether the app is currently scanning for peripherals or not
      peripherals: null, // the peripherals detected
      connected_peripheral: null, // the currently connected peripheral
      info: "",
      values: {},
      tester: "",
    }

    //Drey
    // this.prefixUUID = "33134D"
    // this.suffixUUID = "-24FC-4193-BD70-48980231B857"

    //Hello
    this.prefixUUID = "164C59"
    this.suffixUUID = "-A528-4A85-8E31-0FFA617DCD44"

    // this.UUID = "164C59CB-A528-4A85-8E31-0FFA617DCD44"
    // 33134DA3-24FC-4193-BD70-48980231B857
    this.sensors = {
      0: "Temperature",
      1: "Accelerometer",
      2: "Humidity",
      3: "Magnetometer",
      4: "Barometer",
      5: "Gyroscope"
    }
  }  

  serviceUUID(num) {
    //return this.prefixUUID + "A3" + this.suffixUUID
    // return "DFB0"
    return "FFE0"
  }

  notifyUUID(num) {
    //return this.prefixUUID + "A3" + this.suffixUUID
    // return "DFB1"
    return "FFE1"
  }

  writeUUID(num) {
    //return this.prefixUUID + "A3" + this.suffixUUID
    return "FFE1"
    // return "DFB1"
  }

  info(message) {
    this.setState({info: message})
  }

  error(message) {
    this.setState({info: "ERROR: " + message})
  }

  updateValue(key, value) {
    this.setState({values: {...this.state.values, [key]: value}})
  }

  

  componentWillMount() {
    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
          this.scanAndConnect();
          subscription.remove();
      }
    }, true);



    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {

      var peripherals = this.peripherals; // get the peripherals
      // check if the peripheral already exists
      var el = peripherals.filter((el) => {
        return el.id === peripheral.id;
      });

      if(!el.length){
        peripherals.push({
          id: peripheral.id, // mac address of the peripheral
          name: peripheral.name // descriptive name given to the peripheral
        });
        this.peripherals = peripherals; // update the array of peripherals
      }
    });
  }

  scanAndConnect() {
    this.manager.startDeviceScan(null, null, (error, device) => {
      this.info("Scanning...")
      console.log(device)
     
      if (device.name === 'HELLO') {
        this.info("Connecting to Bluetooth Device")
        this.manager.stopDeviceScan()
        device.connect(
            //mtu nego
            device.ConnectionOptions(requestMTU = 512)
        )
          .then((device) => {
            this.info("Discovering services and characteristics")
            return device.discoverAllServicesAndCharacteristics()
          })
          .then((device) => {
            this.info("Setting notifications")
            return this.setupNotifications(device)
          })
          .then(() => {
            this.info("Listening...")
          }, (error) => {
            this.error(error.message)
          })
      }
    });
  }


  /*
  Implementation: promise
  Enables notifications for specified sensor by writing value of 0x01 -> configuration characteristic
  Upon completion of write characteristics: Start listening for values
  */

 
  async setupNotifications(device) {
    for (const id in this.sensors) {

      // const service = this.serviceUUID("DFB0")
      // const characteristicW = this.writeUUID("DFB1")
      // const characteristicN = this.notifyUUID("DFB1")

      const service = this.serviceUUID("FFE0")
      const characteristicW = this.writeUUID("FFE1")
      const characteristicN = this.notifyUUID("FFE1")

      /* const imageURL = "http://www.rasteredge.com/how-to/csharp-imaging/barcode-generating-qrcode/lib/QRCode.png";

      Image.getSize(uri, (width, height) => {
        var imageSize = {
          size: {
            width,
            height
          },

          offset: {
            x: 0,
            y: 0,
          },
        };

        ImageEditor.cropImage(imageURL, imageSize, (uri) => {          
          console.log(imageURI);

          ImageStore.getBase64ForTag(imageURI, (base64Data) => {
            this.setState({pictureBase64: base64Data});
            var d = pictureBase64;
            console.log(d)

            }, (pictureBase64) => console.log(pictureBase64))
          }, (reason) => console.log(reason))
        }, (reason) => console.log(reason)) */

      /*
        .then((base64String) => {
          var a = new Buffer ('test')
          var b = a.toString('base64')
          const characteristic = device.writeCharacteristicWithResponseForService(        
            service, 
            characteristicW, 
            //base64String
        )})
        .catch(err => {
          this.error(error.message)
        });
      */

    //  ImgToBase64.getBase64String('file://test.bmp', (err, base64string) => doSomethingWith(base64string));
      
    /* const myFile = 'test.bmp'

    RNImageConverter.getJPEG(myFile, (newFile) => {
      console.log(newFile);
      //4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsND...
     }); */

    /* ImageStore.getBase64ForTag(
      'file://test.bmp',
      (base64image) => {
          this.info('Base 64: ', base64image);
       },
       (error) => {
          console.error(error)
       }
    ) */

      // ImgToBase64.getBase64String('file://test.bmp', (base64string))
      // .then((base64String) => {
      //   //this.info(base64String)
      //   var netx = base64String
      //   this.info("Converting to base64-1")

      //   return netx
      // })
      // .then((netx) => {
      //   //this.info(base64String)
      //   var buffTest = new Buffer(netx)
      //   this.info("Converting to base642")
      //   return buffTest
      // })
      // .catch(function(error) {
      //   console.log('There has been a problem with your fetch operation: ' + error.message);
      //   // ADD THIS THROW error
      //    throw error;
      // });

      var a = new Buffer ('<e3ryy43y4iu234yiu3y4i23y4iu23y41waqwssqrdsgdfgasdsadaeqweweqweqweasdasdasdqweqwaaaaaaaaesr>')
      var b = a.toString('base64')
      var c = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      var d = Base64.encode('file://test.bmp')
      var e = 'iVBORw0KGgoAAAANSUhEUgAAAYgAAAGIAQMAAABhjeVlAAAABlBMVEX///8AAABVwtN+AAAEKUlEQVR4nO2Z7ZLTMAxF9eh6c0Mj3Q+nXbZuZ/ilAE1i+8g7Pr7uALHqyvj7O+K619N1R+ejp0fGEP+JeDRy0Kp3vCwjHgWCZTLCiYwAmT1yiCNided68oHH1C034qoRqAcCrUN8Q2w6KKOb8l9ESh8026RDfEPcktGH3Q+EwohUBY0jokN8StCI+6AHJwJ8i6pRET3MiGvkECeElt69MDF8giQRv/8a4hsCXl6PJYGrv2zMr4jqids1xO8EV1sErt1Dv4noaTIEXc+aYIgPiGXECyHQlPwaivqeocw6D6OVo3r2/EMcE/TVErj47gfdi9IJg+DMmLexIT4jLBjRIpAO6rx/f5TVBeuKYbI/hzghaqlTaci1XfCCzJCoeyJ01HfJzvoZcohjAqtO4maCJu3EUw2mjsdc/xShqYY4IHztsegQBI1oeIw25yQwAaZMnG5DnBJbGORj0wBb158uDfsIYKo0N8A1bQxxSJgA5cgM2IisfwOAUnpNBdJnQ2aHeJ9QYPZcsUNCykdxdVXI6mP1PBJfsw5xQnDna+EzsP5yocPsicgtiCGVeBvilLgtehPW1okpAqwyV/pZJ3s7dAyHOCGQh2yT0LYL0R1kVvpQsLSxXHILaK4hDgg7yWhBsuSjS0NyE41rCyBk/TbEuwR3/7OP120K2xUnGDKHebM4xAmBK+12J9ZOJDIFYZW/sE+08GWIE4IedWO+/J0x3N4ZwwwvhBpDnBB7B/JCG3cjIOCTXqsleBhiX/RBOcR7xLbksrG/uxOz94oIf62GIU4Iu/KHh61kn3B23JX6QCY9Spf/IY4Jrj7H7ZZSPoNlUJ6VC8wbkUOcEAwAelzP5qO51bZxPHJinn5dX4foEGfELRQdLvX5S7TLmmdhqp5QaWSJIc4IaoI9vuxx6TulB9Xx2bYAA8WtMMS7BK+0HEhKuJeMYNclOLABIrY8ImVDHBKbjYrVpg96SuNSJRFIIzZAYsQV0CFOCd/8tvZGKCtGdI16wltthPoJhjgmPB76SEgAqO5Y8CSCiUNf+AYY4oy4+8CJpQKyg7+xVLlY0MXEYTYTO8RHhIKljC0nqhEuK33R4YPutZTLwLxDHBC17u0P6XAfmy78H/3qeDWlelfJxXmHOCaW1p2LH62lB3qIiohoAgoDUNjGWHA/xLsEBsqHBaR+s0FFI9jH6ohfhowP8SmxRNAH0rT7wMVHTBQtFslEVIc4ILDM/XWBD1jAUaaWkBjLE/qvOY14zDrEBwR82LuedyIpOiw56W6xJ5DQId4nsPqpY8yvtM+17gTPQnSyzhDfEtZuo/Y2J3ACdhSD1XtLABjiE2KTsD3uRm5Eq+y2/kJKUNesQ3xBLB9zSwgInniL5+Llv/dAC+fpOcQJYeropUbLAVofBZ+I0Gc11Q8Qq6cY4oD4A5xtkfxlioYpAAAAAElFTkSuQmCC'
  
      const characteristic = await device.writeCharacteristicWithoutResponseForService(        
        service, 
        characteristicW, 
        b
        //checkpoint1
      )

      device.monitorCharacteristicForService(service, (error, characteristic) => {
        if (error) {
          this.error(error.message)
          return
        }
        this.updateValue(characteristic.uuid, characteristic.value)
      })
    }
  }
  
  scanDevice(){           
    bleManagerEmitter.addListener(
    'BleManagerStopScan',
    () => {
      console.log('scan stopped');
      if(this.peripherals.length == 0){
        Alert.alert('Nothing found', "Sorry, no peripherals were found");
      }
      this.setState({
        is_scanning: false,
        peripherals: this.peripherals
      });  
    }
  );
}

  render() {
    return (
      <View style={styles.container}> 
        <Text>{this.state.info}</Text>
        <Text></Text>
        {Object.keys(this.sensors).map((key) => {
          return 
            <Text key={key}>
              {this.sensors[key] + ": " + (this.state.values[this.notifyUUID(key)] || "-")}
            </Text>
        })}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
