//import new libaries
import React, { useEffect, useState, useLayoutEffect, useRef} from "react";
import {View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity} from 'react-native';
import axios from 'axios';
import { userVendorID, usernameValue } from '../Login';
import { useIsFocused } from "@react-navigation/native";
import * as Location from 'expo-location';

const Item = ({message}) => (
  <View style={styles.item}>
      <Text style={styles.title}>{message}</Text>
  </View>
);

const DriverHome = ({ navigation }) => {
  //web socket URL
  const URL = 'wss://nuhyx0cvg8.execute-api.ap-southeast-1.amazonaws.com/prod';
  const socketRef = useRef(null);
  //date setting for current date
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const todayDate = year + "-" + month + "-" + day;

  //announcements array
  const [announcements, setAnnouncements] = useState([]);
  //this vendor ID
  const thisVendor = userVendorID;
  const iSFocused = useIsFocused();
  //this driver ID
  const thisDriver = usernameValue;
  const [jobDetails, setJobDetails] = useState();

  // Grab and fetch the latest 3 announcements from the database
  const fetchData = () => {
    axios
      .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/driver/announcements/3/${thisVendor}`)
      .then((response) => {
        const receivedAnn = response.data;
        setAnnouncements(receivedAnn);
      })
      .catch((error) => {
        console.log('Error fetching announcements', error);
      });
    
    //axios request to fetch driver job details
    axios
      .get('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/get/jobDetails' , {
        params: {
          driver_ID: thisDriver,
          datetime: todayDate,
        },
      })
      .then((response) => {
        const recJobDetails = response.data;
        setJobDetails (recJobDetails);
      })
      .catch((error) => {
        console.log("Error fecthing pickup details", error);
      });
  };

  const setUpConnect = () => {
    if (!socketRef.current) {
      try {
        socketRef.current= new WebSocket(URL);

        socketRef.current.onopen = () => {
          const connection = {
            action: 'setUsers',
            username: usernameValue,
          };
          socketRef.current.send(JSON.stringify(connection));
        };
      } catch (err) {
        console.error("Error establishing connection", err);
      }
    }
  };

  const sendLocationData = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true,
      });
  
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;
  
      const messageData = {
        action: 'sendLocation',
        location: `${latitude}-${longitude}`,
      };
  
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(messageData));
      } else {
        console.error("WebSocket connection is not open.");
      }
    } catch (error) {
      console.error("Error sending location data", error);
    }
  };

  useEffect(() => {
    setUpConnect();
    fetchData();
    const interval = setInterval(() => {
      sendLocationData();
    }, 4000);

    return () => {
      clearInterval(interval)
      if(socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (iSFocused)  { 
      fetchData();
    }
  }, [iSFocused]);
  
  if (!announcements && !jobDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style = {styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  //display
  return(
    <View style={styles.container}>
    <View style={styles.upperRow}>
        
        {/* header */}
        <Text style={styles.header}>News & Notices</Text>
        <TouchableOpacity key='View More'
            onPress={() => navigation.navigate('DriverAnnouncementPage')}
        >
            <Text style={styles.btnText}>View More</Text>
        </TouchableOpacity> 
    </View>

    <View style={styles.list}>
        <FlatList 
        data={announcements}
        renderItem={({item}) => <Item message={item.message} />}
        keyExtractor={(item) => item.ann_ID.toString()}
        />
    </View>
        <Text style={styles.header}>Today's pickup details{'\t\t\t'}{todayDate}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Time</Text>
          <TextInput style={styles.input} value={jobDetails?.timeslot} editable={false} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>School</Text>
          <TextInput style={styles.input} value={jobDetails?.school_Name} editable={false} />
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Plate</Text>
          <TextInput style={styles.input} value={jobDetails?.vehicle_Plate} editable={false} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Region</Text>
          <TextInput style={styles.input} value={jobDetails?.dropoff_Region} editable={false} />
        </View>
        {/* button for location */}
        <TouchableOpacity
            key = "viewMap"
            onPress = {() => 
            navigation.navigate("ViewLocation", {driverID: thisDriver})}
            style={styles.locationBtn}>
            <Text style = {styles.locationText}>View Map</Text>
        </TouchableOpacity>
      </View>
  );
}

export default DriverHome;

//styling
const styles = StyleSheet.create({
  container: {
      flex: 1, 
  },
  header: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#56844B',
      marginTop: 30,
      marginBottom: 10,
      marginLeft: 20 
  },
  upperRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
  },
  list: {
      maxHeight: 230
  },
  item: {
      backgroundColor: 'lightgrey',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 25
  },
  title: {
      fontSize: 14,
      color: 'grey',
      fontWeight: 'bold'
  },
  row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 10,
      paddingVertical: 5,
      paddingTop: 0,
      justifyContent: 'space-between'
  },
  label: {
      color: '#858585',
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 15,
      marginLeft: 5,
  },
  input: {
      padding: 15,
      backgroundColor: '#E6E6E6',
      borderRadius: 8,
      height: 35,
      width: 220,
      marginVertical: 5,
      marginHorizontal: 50,
      color: '#616161',
      fontSize: 12,
      fontWeight: 'bold',
  },
  inputRed: {
      padding: 15,
      backgroundColor: '#E6E6E6',
      borderRadius: 8,
      height: 35,
      width: 220,
      marginVertical: 5,
      marginHorizontal: 50,
      color: '#FF0000',
      fontSize: 12,
      fontWeight: 'bold',
  },
  inputGreen: {
      padding: 15,
      backgroundColor: '#E6E6E6',
      borderRadius: 8,
      height: 35,
      width: 220,
      marginVertical: 5,
      marginHorizontal: 50,
      color: '#56844B',
      fontSize: 12,
      fontWeight: 'bold',
  },
  btnText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#56844B',
      marginTop: 35,
      marginLeft: 150 
  },
  locationBtn: {
    marginHorizontal: 15, 
    backgroundColor: '#56844B',
    padding: 10,
    borderRadius: 8,
    marginTop: 20
  },
  locationText : {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15
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