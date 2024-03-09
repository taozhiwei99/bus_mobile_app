//import libaries
import React, { useEffect, useState, useLayoutEffect } from "react";
import {View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Dimensions} from 'react-native';
import axios from 'axios';
import { userSchoolID, usernameValue } from '../Login';
import { useIsFocused } from "@react-navigation/native";

export let teacherGateName = '';
export let teacherGateID = '';

const Item = ({message}) => (
    <View style={styles.item}>
        <Text style={styles.title}>{message}</Text>
    </View>
);

//main home function
const TeacherHome = ({navigation}) => {
  //set list tab data
  const [listTab, setListTab] = useState([]);
  const [driver, setDriver] = useState(null);
  const [pickup, setPickupList] = useState([]);
  const setDriverFilter = (selectedDriver) => {
    setPickupList([...listTab.filter((e) => e.driver_ID === selectedDriver.driver_ID)]);
    setDriver(selectedDriver.driver_ID);
  };

  //date setting for current date
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const todayDate = year + "-" + month + "-" + day;

  //get announcement data
  const [announcements, setAnnouncements] = useState([]);
  const thisSchool = userSchoolID;
  const thisTeacher = usernameValue;
  const iSFocused = useIsFocused();
  const [gateDetails, setGateDetails] = useState();

  //grab and fetch the latest 3 announcements from database
  const fetchData = () => {
    axios
      .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/teacher/announcements/3/${thisSchool}`)
      .then((response) => {
          const receivedAnn = response.data;
          setAnnouncements(receivedAnn);
      })
      .catch((error) => {
          console.log('Error fetching annoucements', error);
      });

    axios
      .get('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/teacherGate', {
        params : {
          datetime: todayDate,
          teacherID: thisTeacher,
        },
      })
      .then((response) => {
        const recGateDetails = response.data;
        const recGateName = response.data.gate_Name;
        const recGateID = response.data.gate_ID;
        setGateDetails(recGateDetails);
        teacherGateName = recGateName;
        teacherGateID = recGateID;
      })
      .catch((error) => {
        console.log("Error fetching data", error);
      })

    axios
      .get('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/get/teacher/homedrivers', {
        params: {
          datetime: todayDate,
          schoolID: thisSchool,
        },
      })
      .then((response) => {
        const recDriverData = response.data;
        if (recDriverData && recDriverData.length > 0) {
          setListTab(recDriverData);
        } else {
          setListTab([]);
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
  
  if (!announcements && !gateDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  };

  // display for each detail
  const renderItems = ({ item, index }) => {
    return (
      <View key={index}>
        <View>
          {/* button for location */}
          <TouchableOpacity
            key = "viewMap"
            onPress = {() => navigation.navigate("ViewLocation", {driverID: item.driver_ID})}
            style={styles.locationBtn}>
            <Text style = {styles.locationText}>View Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  //display
  return(
    <View style={styles.container}>
      <View style={styles.upperRow}>        
        {/* header */}
        <Text style={styles.header}>News & Notices</Text>
        <TouchableOpacity key='View More'
          onPress={() => navigation.navigate('TeacherAnnouncementPage')}
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
    <Text style={styles.header}>Today's gate details{'\t\t\t'}{todayDate}</Text>
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>Gate ID</Text>
        <TextInput
          style={styles.input}
          value={gateDetails && gateDetails.gate_ID ? gateDetails.gate_ID.toString() : ''}
          editable={false}
        />
      </View>
    </View>
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>Gate</Text>
        <TextInput
          style={styles.input}
          value={gateDetails?.gate_Name}
          editable={false}
        />
      </View>
    </View>

    {/* tabs */}
    <Text style={styles.busHeader}>Bus driver details</Text>
    {listTab.length > 0 && (
      <View style={styles.listTab}>
        {listTab.map((e) => (
          <TouchableOpacity
            key={e.driver_ID}
            style={[
              styles.btnTab,
              driver === e.driver_ID && styles.btnTabActive,
            ]}
            onPress={() => setDriverFilter(e)}
          >
            <Text
              style={[
                styles.textTab,
                driver === e.driver_ID && styles.textTabActive,
              ]}
            >
              {e.fullName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/* flatlist details */}
    <FlatList
      data={pickup}
      keyExtractor={(e, i) => i.toString()}
      renderItem={renderItems}
    />
  </View>
  );
};

export default TeacherHome;

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
  busHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#56844B',
    marginTop: 15,
    marginLeft: 20 
  },
  gate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'grey',
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
    marginTop: 33,
    marginLeft: 145 
  },
  listTab: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginBottom: 20,
    marginTop: 15
  },
  btnTab: {
    width: Dimensions.get('window').width / 4.5,
    flex: 1,
    borderWidth: 1,
    borderColor: '#844b5f',
    padding: 10,
    justifyContent: 'center',
    borderRadius: 8, 
    marginLeft: 10
  },
  btnTabActive: {
    backgroundColor: '#844b5f',
  },
  textTab: {
    color: '#844b5f',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  textTabActive: {
    color: '#ffffff'
  },
  locationBtn: {
    marginHorizontal: 15, 
    backgroundColor: '#56844B',
    padding: 10,
    borderRadius: 8,
    marginTop: 10
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
