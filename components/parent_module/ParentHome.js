// import libaries
import React, { useEffect, useState, useLayoutEffect } from "react";
import {View,Text,StyleSheet,TextInput,FlatList,TouchableOpacity, Dimensions,} from "react-native";
import axios from "axios";
import { useIsFocused } from "@react-navigation/native";
import { userSchoolID , usernameValue} from "../Login";

const Item = ({ message }) => (
  <View style={styles.item}>
    <Text style={styles.title}>{message}</Text>
  </View>
);

const ParentHome = ({ navigation }) => {
  //set and display annoucements
  const [announcements, setAnnouncements] = useState([]);
  const thisSchool = userSchoolID;
  const thisParent = usernameValue;
  const iSFocused = useIsFocused();

  //date setting for current date
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const todayDate = year + "-" + month + "-" + day;

  //self pickup data
  const[thisSelfData, setSelfPickup] = useState([]);
  //bus pickup data
  const[thisBusData, setBusPickup] = useState([]);
  //join the pickup data
  const pickupDetails = thisSelfData.concat(thisBusData);

  // grab and fetch all the needed data for display
  const fetchData = () => {
    axios
      .get( //grabbing announcement data
        `https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/parent/announcements/3/${thisSchool}`
      )
      .then((response) => {
        const receivedAnn = response.data;
        setAnnouncements(receivedAnn);
      })
      .catch((error) => {
        console.log("Error fetching annoucements", error);
      });

    //axio request to pull chilD_IDs
    axios
    .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/childID/${thisParent}`)
    .then((response) => {
      const updateListTab = response.data.map((child) => ({
        key: child.child_ID,
        child: child.lastName,
      }));
      setListTab(updateListTab);
    })
    .catch((error) => {
      console.log('Error fetching child data:', error);
    });

    axios //grabbing self pickup data
      .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/get/selfpickup`, {
        params: {
          parent_ID: thisParent,
          datetime: todayDate,
        },
      })
      .then((response) => {
        const recSelfPickUp = response.data.map((datas) => ({
          key: datas.child_ID,
          timeslot: datas.timeslot,
          gate: datas.gate_Name,
          setMode: "Self pickup",
          driver_ID: null,
          vehicle_plate: null,
          status: datas.status
        }));
        setSelfPickup(recSelfPickUp);
      })
      .catch((error) => {
        console.log("Error fetching self pickup data", error);
      });
    
    axios //grabbing bus pickup data
      .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/get/buspickup` , {
        params: {
          parent_ID: thisParent,
          datetime: todayDate,
        },
      })
      .then((response) => {
        const recBusPickUp = response.data.map((datas2)=> ({
          key: datas2.child_ID,
          timeslot: datas2.timeslot,
          gate: null,
          setMode: "Bus Pickup",
          driver_ID: datas2.driver_ID,
          vehicle_Plate: datas2.vehicle_Plate,
          status: datas2.status
        }));
        setBusPickup(recBusPickUp);
      })
      .catch((error) => {
        console.log("Error fetching bus pickup data", error);
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
  
  if (!announcements && !thisSelfData && !thisBusData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style = {styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // list tab for childs, display n tabs for n child
  const [listTab, setListTab] = useState([]);
  console.log("listtab", listTab);
  // child selection tab for pickup details
  const [child, setChild] = useState();
  console.log("child", child)
  const [pickup, setPickupList] = useState([]);
  console.log('piickup', pickup)
  // filter for pickup details
  const setChildFilter = (selectedChild) => {
    setChild(selectedChild);
    const filteredPickup = pickupDetails.filter((item) => item.key === selectedChild);
    setPickupList(filteredPickup);
  };

  // display for each pickup detail
  const renderItems = ({ item, index }) => {
    return (
      <View key={index}>
        <View>
          <Text style={{ marginHorizontal: 16, fontSize: 20, fontWeight: 'bold', color: '#844b5f', marginBottom: 10 }}>
            {item.key}
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              value={item.timeslot}
              editable={false}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mode</Text>
            <TextInput
              style={styles.input}
              value={item.setMode}
              editable={false}
            />
          </View>
          {item.setMode === 'Self pickup' ? (
            <View>
              <View style={styles.row}>
                <Text style={styles.label}>Gate</Text>
                <TextInput
                  style={styles.input}
                  value={item.gate}
                  editable={false}
                />
              </View>
            </View>
          ) : item.setMode === 'Bus Pickup' ? (
            <View>
              <View style={styles.row}>
                <Text style={styles.label}>Driver ID</Text>
                <TextInput
                  style={styles.input}
                  value={item.driver_ID}
                  editable={false}
                />
              </View>
  
              <View style={styles.row}>
                <Text style={styles.label}>Vehicle Plate</Text>
                <TextInput
                  style={styles.input}
                  value={item.vehicle_Plate}
                  editable={false}
                />
              </View>
            </View>
          ) : null}
  
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            {/* text colour changes based on pick up status  */}
            <TextInput
              style={[
                item.status === 'Waiting' ? styles.waitingStats :
                item.status === 'Picked Up' ? styles.pickedupStats :
                styles.droppedOffStatus]
              }
              value={item.status}
              editable={false}
            />
          </View>
          {/* button for location */}
          {item.setMode === 'Bus Pickup' && (
            <TouchableOpacity
              key = "viewMap"
              onPress = {() => 
              navigation.navigate("ViewLocation", {driverID: item.driver_ID})}
              style={styles.locationBtn}>
            <Text style = {styles.locationText}>View Map</Text>
          </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  //display
  return (
    <View style={styles.container}>
      <View style={styles.upperRow}>
        <Text style={styles.header}>News & Notices</Text>
        <TouchableOpacity
          key="View More"
          onPress={() => navigation.navigate("ParentAnnouncementPage")}
        >
          <Text style={styles.btnText}>View More</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.list}>
        <FlatList
          data={announcements}
          renderItem={({ item }) => <Item message={item.message} />}
          keyExtractor={(item) => item.ann_ID.toString()}
        />
      </View>
      <Text style={styles.header}>Pickup details for:{'\t\t\t'} {todayDate}</Text>
  
      {/* tabs */}
      {listTab.length > 0 && ( // Check if listTab is not empty
        <View style={styles.listTab}>
          {listTab.map((e) => (
            <TouchableOpacity
              key={e.key}
              style={[styles.btnTab, child === e.key && styles.btnTabActive]}
              onPress={() => setChildFilter(e.key)}
            >
              <Text style={[styles.textTab, child === e.child && styles.textTabActive]}>
                {e.child}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
  
      {/* pickup details */}
      <FlatList
        data={pickup}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItems}
      />
    </View>
  );
}

export default ParentHome;

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
        maxHeight: 190
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
        marginLeft: 15,
        marginRight: 10,
        color: '#616161',
        fontSize: 12,
        fontWeight: 'bold',
    },
    waitingStats: {
        padding: 15,
        backgroundColor: '#E6E6E6',
        borderRadius: 8,
        height: 35,
        width: 220,
        marginVertical: 5,
        marginHorizontal: 50,
        marginLeft: 15,
        marginRight: 10,
        color: '#C0C0C0',
        fontSize: 12,
        fontWeight: 'bold',
    },
    droppedOffStatus: {
        padding: 15,
        backgroundColor: '#E6E6E6',
        borderRadius: 8,
        height: 35,
        width: 220,
        marginVertical: 5,
        marginHorizontal: 50,
        marginLeft: 15,
        marginRight: 10,
        color: '#56844B',
        fontSize: 12,
        fontWeight: 'bold',
    },
    pickedupStats: {
        padding: 15,
        backgroundColor: '#E6E6E6',
        borderRadius: 8,
        height: 35,
        width: 220,
        marginVertical: 5,
        marginHorizontal: 50,
        marginLeft: 15,
        marginRight: 10,
        color: '#FFA500',
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
    listTab: {
      flexDirection: 'row',
      marginHorizontal: 10,
      marginBottom: 20
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
      backgroundColor: '#ADD8E6',
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
      marginTop: 5
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