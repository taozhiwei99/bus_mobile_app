//import libaries
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-elements';
import { Avatar } from 'react-native-paper';
import axios from 'axios';
import {useIsFocused } from '@react-navigation/native';
import { userSchoolID } from '../Login';

const DriverList = ({ navigation }) => {
    //date setting for current date
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const todayDate = year + "-" + month + "-" + day;

    //set this school_ID
    const thisSchool = userSchoolID;
    const iSFocused = useIsFocused();
    //set driver data for the school
    const [driverData , setDriverData] = useState([]);

    //fetch driver data
    const fetchData = () => {
        axios
            .get('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/get/teacher/drivers', {
                params: {
                    datetime: todayDate,
                    schoolID : thisSchool,
                },
            })
            .then((response) => {
                const recDriverData = response.data;
                if(recDriverData && recDriverData.length >0) {
                    setDriverData(recDriverData);
                } else {
                    setDriverData([]);
                }
            })
            .catch((error) => {
                console.log("Error fetching driver data", error);
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
      if (!driverData) {
        return (
          <View style={styles.loadingContainer}>
            <Text style = {styles.loadingText}>Loading...</Text>
          </View>
        );
      }

    //display
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Driver Details for {'\t\t\t\t'}{todayDate}</Text>
        </View>
        {driverData.map((data, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate('TeacherBusPickup', {driverID: data.driver_ID})}>
              <Card containerStyle={styles.card}>
              <View style={{ flexDirection: 'row', 
                alignItems: 'center',
                padding: 10 }}>
                   <Avatar.Image
                    source ={data.imageURI ? {uri: data.imageURI} : require('../common/picture/driver.jpg')}
                    size = {80}
                   />
                  <View style={{ marginLeft: 35, marginTop: 5 }}>
                    <Text style={styles.title}>{'Name     : '}{data.fullName}</Text>
                    <Text style={styles.caption}>{'Car Plate : '}{data.vehicle_Plate}</Text>
                    <Text style={styles.caption}>{'Time        : '}{data.timeslot}</Text>
                    <Text style={styles.caption}>{'Region    : '}{data.dropoff_Region}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
};

export default DriverList;
  
//styling
const styles = StyleSheet.create({
    container: {
      flex: 1,
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
        paddingRight: 100,
        backgroundColor: '#56844B',
        paddingTop: 5,
        borderRadius: 15,
    },
    title: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 5,
    },
    caption: {
        paddingTop: 5,
        fontSize: 15,
        lineHeight: 14,
        fontWeight: '500',
        color: '#ffffff'
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