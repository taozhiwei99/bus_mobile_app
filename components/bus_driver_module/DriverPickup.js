//import libaries
import {SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView} from 'react-native';
import { Card, Icon } from 'react-native-elements'
import React, { useState, useEffect, useLayoutEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import axios from 'axios';
import { usernameValue } from '../Login';
import {Alert} from 'react-native';

//driver jobs
const DriverPickup = ({navigation}) => {
  //set this driver ID
  const thisDriver = usernameValue;
  const iSFocused = useIsFocused();

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
  const [todayTime, setTodayTime]= useState(null);
  const [todaySchool, setTodaySchool] = useState(null);
  //store driver jobs 
  const [driverJobs, setDriverJobs]= useState([]);

  //fetch driver jobs data
  const fetchData = () => {
    axios
      .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/get/driverJobs`, {
        params: {
          driver_ID: thisDriver,
          datetime: todayDate,
        },
      })
      .then((response) => {
        const receivedJobs = response.data;
        if (receivedJobs && receivedJobs.length >0 ) {
          setDriverJobs(receivedJobs);
          setTodayTime(receivedJobs[0].timeslot);
          setTodaySchool(receivedJobs[0].school_Name)
        } else {
          setDriverJobs([]);
          setTodayTime('');
          setTodaySchool('');
        }
      })
      .catch((error) => {
        console.log("Error fetching data", error);
      });
  };

  //handle onclick for status
  const manualButton = (thisChildID, thisStatus) => {
    let tempStatus;
    let tempChildID = thisChildID;

    if (thisStatus === 'Waiting') {
      tempStatus = 'Picked Up';
    } else if ( thisStatus === 'Picked Up') {
      tempStatus = 'Dropped Off';
    }

    const confirmMsg = `Update status to ${tempStatus}?`;

    Alert.alert(
      'Update Status',
      confirmMsg,
      [
        {
          text: 'Yes',
          onPress: () => { 
            updateStatus(tempChildID, tempStatus);
          },
        },
        {
          text: 'No',
          style: 'cancel',
        },
      ],
      {cancelable: false }
    );
  }

  //update status function
  const updateStatus  = (thisChild, status) => {
    if (status === 'Picked Up') {
      const newDetails = {
        newStats : status,
        datetime: todayDate,
        childID : thisChild,
      }
      axios
        .put('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/driver/updatePickedup', newDetails)
        .then((response) => {
          alert("Status updated!");
          fetchData();
        })
        .catch((error) => {
          alert("Error, please try again!");
          console.log("Error from server:", error);
        });

    } else if (status === 'Dropped Off') {
      const newDetails = {
        newStats: status,
        timestamp: formattedDate,
        datetime: todayDate,
        childID: thisChild,
      }
      axios
        .put('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/driver/updateDroppedoff',newDetails)
        .then((response) => {
          alert("Status updated!");
          fetchData();
        })
        .catch((error) => {
          alert("Error, please try again!");
          console.log("Error from server:", error);
        });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useLayoutEffect(() => {
    if (iSFocused)  { 
      fetchData();
    }
  }, [iSFocused]);
  
  //buffer
  if (!driverJobs) {
    return (
      <View style={styles.loadingContainer}>
        <Text style = {styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  //display
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
            <View style={styles.header_row}>
              <Text style={styles.header}>Student Passenger Details</Text>
              <Icon style={styles.icon} 
                        name='qrcode-scan'
                        type='material-community'
                        onPress={() => navigation.navigate('DriverScanQR')}
              />
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Today's School</Text>
                <TextInput style={styles.input} value={todaySchool !==null ? todaySchool : ''} editable={false}/>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Today's Pickup Time</Text>
                <TextInput style={styles.input} value={todayTime !==null ? todayTime : ''} editable={false}/>
            </View>
                
            <View >
            {
              driverJobs.map((data, index) => {
                const droppedOff = data.status === 'Dropped Off';
                return (
                  <Card key={index}>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{flex: '2'}}>
                            <Text style={styles.name}>{data.fullName}</Text>
                            <Text style={styles.address}>{data.address}</Text>
                        </View>
                        <View style={{justifyContent: 'flex-end', flex: '1'}}>
                            <TouchableOpacity 
                              style={[
                                data.status === 'Waiting' ? styles.waitingButton :
                                data.status === 'Picked Up' ? styles.pickedupButton :
                                styles.droppedOffBtn
                              ]}
                              onPress = {() => !droppedOff && manualButton(data.child_ID, data.status)}
                              disabled= {droppedOff}>
                            <Text style={styles.droppedOffText}>{data.status}</Text>
                            </TouchableOpacity> 
                        </View>
                    </View>
                  </Card>
                );
                })
            }
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default DriverPickup;

// styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 15,
  },
  header: {
    color: '#56844B',
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 15,
    paddingHorizontal: 15
  },
  name: {
    fontSize: 17,
    color: '#56844B',
    fontWeight: '500'
  },
  address: {
    paddingTop: 5
  },
  header_row:{
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  icon:{
    paddingTop: 15,
    paddingLeft:90,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    paddingTop: 15
  },
  label: {
      color: '#808080',
      fontSize: 15,
      fontWeight: 'bold',
      marginTop: 15,
      marginLeft: 5
  },
  input: {
    padding: 15,
    backgroundColor: '#E6E6E6',
    borderRadius: 8,
    height: 35,
    width: '53%',
    marginVertical: 5,
    marginHorizontal: 7,
    color: '#616161',
    fontSize: 15,
    fontWeight: 'bold',
    paddingTop: '3.5%',
},
  droppedOffBtn: {
    backgroundColor: '#56844B',
    width: '100%',
    borderRadius: 5,
    padding: 4,
    paddingVertical: 5,
    marginTop: 15,
  },
  pickedupButton: {
    backgroundColor: '#FFA500',
    width: '100%',
    borderRadius: 5,
    padding: 4,
    paddingVertical: 5,
    marginTop: 15,
  },
  waitingButton: {
    backgroundColor: '#C0C0C0',
    width: '100%',
    borderRadius: 5,
    padding: 4,
    paddingVertical: 5,
    marginTop: 15,
  },
  droppedOffText: {
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 3 * 16,
    fontWeight: 'bold',
  },
});
