//import libaries
import { View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import { Card} from 'react-native-elements'
import React, { useState, useEffect, useLayoutEffect } from "react";
import { useIsFocused, useRoute } from "@react-navigation/native";
import axios from 'axios';

const TeacherBusPickUp = ({navigation}) => {
  //set driver_ID
  const route = useRoute();
  const {driverID} = route.params;

  //date setting for current date
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const todayDate = year + "-" + month + "-" + day;
  const iSFocused = useIsFocused();
  //set bus driver jobs
  const [busJobs, setBusJobs] = useState([]);

  //fetch bus pickup data
  const fetchData = () => {
    axios
      .get('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/get/teacher/busJobs', {
        params: {
          datetime: todayDate,
          driverID: driverID,
        },
      })
      .then((response) => {
        const recBusJobs = response.data;
        if(recBusJobs && recBusJobs.length >0) {
          setBusJobs(recBusJobs);
        } else {
          setBusJobs([]);
        } 
      })
      .catch((error) => {
        console.log("Error fetching bus pick up data", error);
      });
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
  if (!busJobs) {
    return (
      <View style={styles.loadingContainer}>
        <Text style = {styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  //display
  return (
    <ScrollView style={styles.container}>
        <View>
            <View style={styles.header_row}>
                <Text style={styles.header}>Student Pick-Up Details{'\t\t'}{todayDate}</Text>
            </View>
            <View >
            {
              busJobs.map((data, index) => {
                return (
                    <Card key={index}>
                      <TouchableOpacity 
                        onPress={() => navigation.navigate('StudentQR', 
                        {childID: data.child_ID, childfName: data.fullName})}
                      >
                        <View style={{flexDirection: 'row'}}>
                            <View style={{flex: '2', marginTop: 5}}>
                                <Text style={styles.name}>{data.fullName}</Text>
                                <Text style={styles.address}>{data.dropoff_Address}</Text>
                                <Text style={styles.time}>{data.timeslot}</Text>
                            </View>
                            <View style={{justifyContent: 'flex-end', flex: '1'}}>
                                <TouchableOpacity
                                style = {[
                                  data.status === 'Waiting' ? styles.waitingButton : 
                                  data.status === 'Picked Up' ? styles.pickedupButton:
                                  styles.droppedOffBtn
                                ]} 
                                disabled = {true}>
                                <Text style={styles.droppedOffText}>{data.status}</Text>
                                </TouchableOpacity> 
                            </View>
                        </View>
                      </TouchableOpacity>
                    </Card>
                );
                })
            }
            </View>
        </View>
    </ScrollView>
  );
}

export default TeacherBusPickUp;

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
  card: {
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 130,
    backgroundColor: '#56844B',
    paddingTop: 5,
    borderRadius: 15,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  caption: {
    paddingTop: 5,
    fontSize: 15,
    lineHeight: 14,
    fontWeight: '500',
    color: '#ffffff'
  },
  name: {
    fontSize: 17,
    color: '#56844B',
    fontWeight: '500'
  },
  address: {
    paddingTop: 5
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
  driverLabel: {
      color: '#808080',
      fontSize: 15,
      fontWeight: 'bold',
      marginTop: 15,
      marginLeft: 15
  },
  driverBtn: {
    padding: 12,
    margin: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: "#56844B"
  },
  driverText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff'
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