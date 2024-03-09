//import libaries
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import {Alert} from 'react-native';
import { usernameValue } from '../Login';
import axios from 'axios';

//main for driver scan qr code
export default function DriverScanQR({ navigation }) {
  const [permission, setPermission] = useState(null);
  const [scannedData, setScannedData] = useState(false);
  const thisDriver = usernameValue;

  //date setting for current date
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const todayDate = year + "-" + month + "-" + day;
  const hour = today.getHours();
  const min = today.getMinutes();
  const second = today.getSeconds();
  const formattedDate = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + second;

  //get cam permission
  const requestCam = () => {
    (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setPermission(status == 'granted')
    })()
  }
  useEffect(() => {
    requestCam();
  }, []);

  // handle bar code scanned function
  const barCodeScan = ({type, data}) => {
    setScannedData(true);
    validateQR(data);
  }

  //check permissions
  if (permission === null) {
    return (
        <View style={styles.container}>
            <Text>Requesting for camera permission</Text>
        </View>
    )
  }

  if (permission === false) {
    return (
        <View style={styles.container}>
            <Text style={{margin: 10}}>Requesting for camera permission</Text>
            <Button title={'Allow Camera'} onPress={() => requestCam()}/>
        </View>
    )
  };

  //validate QR code function
  const validateQR = (receivedData) => {
    const bodyData = {
      QRData: receivedData,
      todayDate: todayDate,
      driverID: thisDriver,
    };

    axios
      .post('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/qr/driver/validation', bodyData)
      .then((response) => {
        const recStats = response.data[0].status;
        const recChildID = response.data[0].child_ID;
        updateStatus(recStats, recChildID);
      })
      .catch((error) => {
        Alert.alert(
          'Alert',
          'Invalid QR Code!',
          [
            {
              text: 'Ok',
            },
          ]
        );
      });
  };

  //update status function
  const updateStatus = (thisStatus, thisChildID) => {
    let tempStats;

    if (thisStatus === 'Waiting') {
      tempStats = 'Picked Up';

      const bodyData = {
        datetime: todayDate,
        childID: thisChildID,
        driverID: thisDriver,
        status: tempStats,
      };

      axios
        .put('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/qr/driver/updatePickedup', bodyData)
        .then((response) => {
          Alert.alert(
            'Alert',
            'Child Picked Up!',
            [
              {
                text: 'Ok',
              },
            ]
          );
        })
        .catch((error) => {
          Alert.alert(
            'Error',
            'Unexpected error occured, try again!',
            [
              {
                text: 'Ok',
              },
            ]
          );
      });

    } else if (thisStatus === 'Picked Up') {
      tempStats = 'Dropped Off';

      const bodyData = {
        datetime: todayDate,
        childID: thisChildID,
        driverID: thisDriver,
        status: tempStats,
        timestamp: formattedDate,
      };

      axios
        .put('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/qr/driver/updateDroppedoff', bodyData)
        .then((response) => {
          Alert.alert(
            'Alert',
            'Child Dropped Off!',
            [
              {
                text: 'Ok',
              },
            ]
          );
        })
        .catch((error) => {
          Alert.alert(
            'Error',
            'Unexpected error occured, try again!',
            [
              {
                text: 'Ok',
              },
            ]
          );
      });
    } else if (thisStatus === 'Dropped Off') {
      Alert.alert(
        'Warning',
        'This child has already been dropped off!',
        [
          {
            text: 'Ok',
          },
        ]
      );
    }
  };

  //function to rescan qr code
  const reScan = () => {
    Alert.alert(
      'Alert',
      'Scan next data?',
      [
        {
          text: 'No',
          onPress: () => {
            navigation.navigate('DriverPickup')
          },
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: () => {
            setScannedData(false);
          }
        }
      ],
      {cancelable: false}
    );
  };

  // rendering data
  return (
    <View style={styles.container}>
        <View style={styles.barcodebox}>
            <BarCodeScanner
                onBarCodeScanned={scannedData ? undefined : barCodeScan}
                style = {{ height: 350, width: 350 }} />
        </View>
        {scannedData && <Button title='Scan again?' onPress={reScan} color='red'/>}
  </View>
  )
};

// styling
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    barcodebox:{
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        height: 350,
        width: 350,
        overflow: 'hidden',
        borderRadius: 30,
        backgroundColor: 'red',
    },
    maintext: {
        fontSize: 16,
        margin: 20,
    },
});
