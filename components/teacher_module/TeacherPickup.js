//import libaries
import {SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView} from 'react-native';
import { Card, Icon } from 'react-native-elements'
import React, { useState, useEffect, useLayoutEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import axios from 'axios';
import {Alert} from 'react-native';
import {teacherGateName, teacherGateID} from './TeacherHome';

const TeacherPickup = ({navigation}) => {
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

  //set this gate name
  const thisGateName = teacherGateName;
  //set this gate ID
  const thisGateID = teacherGateID;
  const iSFocused = useIsFocused();
  //set self pickup jobs data
  const [selfJobs, setSelfJobs] = useState([]);

  //fetch self pickup data
  const fetchData = () => {
    axios
      .get('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/get/teacher/selfpikcup', {
        params: {
          datetime: todayDate,
          gateID: thisGateID,
        },
      })
      .then((response) => {
        const recSelfJobs = response.data;
        if (recSelfJobs && recSelfJobs.length >0) {
          setSelfJobs(recSelfJobs);
        } else {
          setSelfJobs([]);
        }
      })
      .catch((error) => {
        console.log("Error fetching self pick up data", error);
      });
  };

  //handle onclick for status
  const manualButton = (thisChildID, thisStatus) => {
    let tempStatus;
    let tempChildID = thisChildID;

    if (thisStatus === 'Waiting') {
      tempStatus = 'Picked Up';
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
      {cancelable: false}
    );
  }

  //update status function
  const updateStatus = (thisChild, status) => {
    if (status === 'Picked Up') {
      const newDetails = {
        newStats : status,
        datetime: todayDate,
        childID: thisChild,
        timestamp: formattedDate,
      }
      axios
        .put(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/teacher/updatePickedUp`, newDetails)
        .then((response) => {
          alert("Status updated!");
          fetchData();
        })
        .catch((error) => {
          alert("Error, please try again!");
          console.log("Error from server:", error);
        });
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useLayoutEffect(() => {
    if (iSFocused)  { 
      fetchData();
    }
  }, [iSFocused]);
  
  //buffer
  if (!selfJobs) {
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
                <Text style={styles.header}>Self Pick-Up Details{'\t'}</Text>
                <Icon style={styles.icon} 
                      name='qrcode-scan'
                      type='material-community'
                      onPress={() => navigation.navigate('TeacherScanQR')}
                />
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Gate Assignment</Text>
                <TextInput style={styles.input} value={thisGateName !==null ? thisGateName: ''} editable={false}/>
            </View>
            <View >
            {
              selfJobs.map((data, index) => {
                const pickedUp = data.status === 'Picked Up';
                return (
                    <Card key={index}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{flex: '2', marginTop: 5}}>
                                <Text style={styles.name}>{data.fullName}</Text>
                                <Text style={styles.time}>{data.timeslot}</Text>
                            </View>
                            <View style={{justifyContent: 'flex-end', flex: '1'}}>
                                <TouchableOpacity 
                                  style={[
                                    data.status === 'Waiting' ? styles.waitingButton:
                                    styles.pickedupButton
                                  ]}
                                  onPress = {() => !pickedUp && manualButton(data.child_ID, data.status)}
                                  disabled ={pickedUp}>
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

export default TeacherPickup;

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
  time: {
    paddingTop: 5
  },
  otp:{
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 23,
    color: '#e27602',
  },
  header_row:{
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  icon:{
    paddingTop: 15,
    paddingLeft:110,
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
      paddingTop: '3.5%'
  },
  pickedupButton: {
    backgroundColor: '#56844B',
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
