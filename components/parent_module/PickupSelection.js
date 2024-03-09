//import libaries
import { StyleSheet, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, TextInput} from 'react-native';
import {Text} from 'react-native-paper'
import React, { useState, useEffect, useLayoutEffect} from "react";
import axios from 'axios';
import { useIsFocused } from "@react-navigation/native";
import {useRoute} from "@react-navigation/native";
import { SelectList } from 'react-native-dropdown-select-list'
import { userSchoolID } from '../Login';
import { usernameValue } from '../Login';

const PickupSelection = () => {
  //grab the childID based on which GUI selected
  const route = useRoute();
  const {thisChild} = route.params;
  //the current school ID
  const thisSchool = userSchoolID;
  const iSFocused = useIsFocused();
  //set child data
  const [thisChildData, setThisData] = useState(null);
  //raw gate data
  const [gateRaw, setRawGate] = useState(null);
  //store the mapped gateData with capacity left
  const [gateData, setGateData] = useState([]);

  //set button data for self or bus pickup
  const [buttonselected, setButton] = useState(null);
  //set sub tier
  const [thisSub, setThisSub] = useState(null);
  const thisParent = usernameValue;
  
  //new address
  const [newAddress, setAddress] = useState("");
  const [newRegion, setRegion] = useState("");

  //this is needed to set the state of a select list
  const [selected, setSelected] = React.useState(null);
  const [selected2, setSelected2] = React.useState(null);
  const [selected3, setSelected3] = React.useState(null);
  const selfTime = selected;
  const busTime = selected2;
  const thisGate = selected3;

  //datetime setup
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const todayDate = year + "-" + month + "-" + day;
  const hour = today.getHours();
  const min = today.getMinutes();
  const second = today.getSeconds();
  const timeStamp = hour + ":" + min + ":" + second;
  const [timestampHour, timestampMin, timestampSecond] = timeStamp.split(":").map(Number);
  const timeStampSecond = timestampHour *3600 + timestampMin *60 + timestampSecond;
  const formattedDate = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + second;

  //timing for self pickup 
  const selfTiming = [
    {key:'1', value:'Select a time slot', disabled: true},
    {key:'2', value:'1:30pm'},
    {key:'3', value:'2:00pm'},
    {key:'4', value:'2:30pm'},
    {key:'5', value:'3:00pm'},
    {key:'6', value:'3:30pm'},
    {key:'7', value:'4:00pm'},
    {key:'8', value:'4:30pm'},
    {key:'9', value:'5:00pm'},
    {key:'10', value:'5:30pm'},
  ]
  //timing for bus pickup
  const busTiming = [
    {key:'1', value:'2:30pm'},
    {key:'2', value:'5:30pm'},
  ]

  const defaultData1 = [
    {key: "1", value: "Please select a pickup type first", disabled: true}
  ]

  const defaultData2 = [
    {key: "1", value: "Please select a timeslot first", disabled: true}
  ]

  //fetch child data based on childID that is received from GUI
  const fetchData = () => {
    //axios to get child data
    axios
      .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/pickupchild/${thisChild}`)
      .then((response) => {
        const recData = response.data;
        const recSub = response.data.subscription;
        setThisData(recData);
        setThisSub(recSub);
        axios
          .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/gates/${thisSchool}`)
          .then((response) => {
            //put the raw data
            const recData2 = response.data;
            setRawGate(recData2);
          })
          .catch((error) => {
            console.log("Error fetching gate data:", error);
          });
      })
      .catch((error) => {
        console.log('Error fetching child data:', error);
      });
    };

  useEffect(() => {
  }, [thisChildData]);

  useEffect(() => {
    fetchData();
  }, []);

  useLayoutEffect(() => {
    if (iSFocused)  { 
      fetchData();
    }
  }, [iSFocused]);

  //validate user subscription tier
  const subscriptionCheck = thisSub === 'Normal';

  //reset values upon switching pages
  const resetSelects = () => {
    setButton(null);
    setSelected(null);
    setSelected2(null);
    setSelected3(null);
  };

  useEffect(() => {
    resetSelects();
  }, []);

  useLayoutEffect(()=> {
    resetSelects();
  }, [iSFocused]);
  
  if (!thisChildData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style = {styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  //trim the address input
  const newAddressCheck = () => {
    return newAddress.trim() === '' && newRegion.trim() ==='';
  };

  //convert time to 24hour clock in seconds for comparison 
  const convertTime = (timeStr) => {
    const [time, amPM] = timeStr.split(/(?=[ap]m)/i);
    const [hour, minute] = time.split(":").map(Number);
    
    let convertHour = hour;
    if (/pm/i.test(amPM) && hour !==12) {
      convertHour +=12;
    } else if (/am/i.test(amPM) && hour ==12) {
      convertHour = 0;
    }
    return convertHour * 3600 + minute * 60;
  };

  // Button to send the data to the database when a pickup is confirmed
  const confirmButton = () => {
    // Button validation
    if (buttonselected === 'self') {
      if (!selected || !selected3) {
        alert("Please select both timeslot and gate");
      } else {
        const selfTimeSecond = convertTime(selected);
        if (timeStampSecond <= selfTimeSecond - 3600) {
          // API request to check if booking exists
          axios
            .get("https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/checkBooking", {
              params: {
                child_ID: thisChild,
                datetime: todayDate,
              },
            })
            .then((response) => {
              if (response.data.success) { // Passing payload to create job
                const payloadSelf = {
                  datetime: formattedDate,
                  timeslot: selfTime,
                  parent_ID: thisParent,
                  child_ID: thisChild,
                  gate_ID: thisGate,
                  school_ID: thisSchool,
                };
                // API request to insert payload
                axios
                  .post("https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/selfpickup", payloadSelf)
                  .then((response) => {
                    alert("Booking confirmed!");
                  }) 
                  .catch((error) => {
                    console.error("Error inserting data:", error);
                    alert("Error, please try again!");
                  });  
              } else {
                alert("You already have a booking for today!");
              }
            })
            .catch((error) => {
              console.error("Error checking booking:", error);
              alert("Error, please try again!");
            });
        } else {
          alert("Please book at least an hour before each timeslot!");
        }
      }
    } else if (buttonselected === 'bus') {
      if (!selected2) {
        alert("Please select a timeslot");
      } else {
        const busTimeSecond = convertTime(selected2);
        if (timeStampSecond <= busTimeSecond - 3600) {
          if (newAddressCheck()) {
            const thisAddress = thisChildData.address;
            const thisRegion = thisChildData.region;
            axios
              .get("https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/checkBooking", {
                params: {
                  child_ID: thisChild,
                  datetime: todayDate,
                },
              })
              .then((response) => {
                if (response.data.success) {
                  const payloadBus = {
                    datetime: formattedDate,
                    timeslot: busTime,
                    address: thisAddress,
                    region: thisRegion,
                    parent_ID: thisParent,
                    child_ID: thisChild,
                    school_ID: thisSchool,
                  };
                  axios
                    .post("https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/buspickup", payloadBus)
                    .then((response) => {
                      alert("Booking confirmed!");
                    })
                    .catch((error) => {
                      console.error("Error inserting data:", error);
                      alert("Error, please try again!");
                    });
                } else {
                  alert("You already have a booking for today!");
                }
              })
              .catch((error) => {
                console.error("Error checking booking:", error);
                alert("Error, please try again!");
              });
          } else {
            if (newAddress.trim() === "" || newRegion.trim() === "") {
              alert("Please enter both new address and new region!");
            } else {
              const thisAddress = newAddress;
              const thisRegion = newRegion;
              axios
                .get("https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/checkBooking", {
                  params: {
                    child_ID: thisChild,
                    datetime: todayDate,
                  },
                })
                .then((response) => {
                  if (response.data.success) {
                    const payloadBus = {
                      datetime: formattedDate,
                      timeslot: busTime,
                      address: thisAddress,
                      region: thisRegion,
                      parent_ID: thisParent,
                      child_ID: thisChild,
                      school_ID: thisSchool,
                    };
                    axios
                      .post("https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/buspickup", payloadBus)
                      .then((response) => {
                        alert("Booking confirmed!");
                      })
                      .catch((error) => {
                        console.error("Error inserting data:", error);
                        alert("Error, please try again!");
                      });
                  } else {
                    alert("You already have a booking for today!");
                  }
                })
                .catch((error) => {
                  console.error("Error checking booking:", error);
                  alert("Error, please try again!");
                });
            }
          }
        } else {
          alert("Please book at least an hour before each timeslot!");
        }
      }
    } else {
      alert("Please select a pickup method");
    }
  };

  //get current job created function
  const getCapacity = () => {
    setSelected3(null);
    //send this data to backend
    const sendingData = {
      timeSlot: selfTime,
      school_ID: thisSchool,
      todayDate: todayDate,
    };

    axios
      .post('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/spuCapacity', sendingData)
      .then((response)=> {
        //calculate the capacity left and map it
        const calculateCapacity = gateRaw.map((gate) => {
          const thisGate = response.data.find((item) => item.gate_ID === gate.gate_ID);
          //if a matching ID found, perform calculation
          if (thisGate) {
            const capacityDiff = gate.capacity - thisGate.capacity;
            return {
              key: gate.gate_ID, 
              value: `${gate.gate_Name} \t\t\t\t\tCapacity left - ${capacityDiff}`,
              disabled: capacityDiff === 0
            };
          } else { //else return original data
            return{
              key: gate.gate_ID, 
              value: `${gate.gate_Name} \t\t\t\t\tCapacity left - ${gate.capacity}`,
              disabled: gate.capacity === 0
            };
          }
        });
        setGateData(calculateCapacity);
      })
      .catch((error) => {
        console.log("Error fetching data for jobs:" , error);
      });
  };
  
  //display
  return (
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior = "padding" 
      >
      <View style={styles.container}>
        <ScrollView>
          <View>
            <Text style={styles.childHeader}>Pickup Selection for {thisChildData.firstName} {thisChildData.lastName}</Text>
          </View>
          
          {/* pickup method selection - bus*/}
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Pickup selection methods</Text>
            <Text style={styles.subheader}>Please select one of the following methods for child pickup</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.pickupBtn, styles.leftButton, buttonselected === 'self' && styles.buttonSelect]}
                onPress={() => {
                  if (buttonselected !== 'self') {
                    setButton('self');
                    setSelected2(null);
                  }  
                }}
              >
                <Text style={styles.pickupText}>Self Pickup</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.pickupBtn, styles.rightButton, buttonselected === 'bus' && styles.buttonSelect, subscriptionCheck && styles.disabledButton]}
                disabled={subscriptionCheck}
                onPress={() => {
                  if (buttonselected !== 'bus') {
                    setButton('bus');
                    setSelected(null);
                    setSelected3(null);
                  }
                }}
              >
                <Text style={styles.pickupText}>Bus Pickup</Text>
              </TouchableOpacity>
            </View>
          </View>
    
          {/* pickup timeslot selection */}
          <View style={styles.headerContainer}> 
            <Text style={styles.header}>Pickup time-slot selection</Text>
            <Text style={styles.subheader}>
              {buttonselected ? "Please choose a timeslot below" : "Please select a pickup type first"}
            </Text>
        
            {/* drop down for timing selection */}
            {buttonselected === "self" && (
              <View style={styles.dropdownContainer}>
                <SelectList
                  setSelected={setSelected}
                  data={selfTiming}
                  save="value"
                  onSelect={getCapacity}
                />
              </View>
            )}
    
            {buttonselected === 'bus' && (
              <View style={styles.dropdownContainer}>
                <SelectList
                  setSelected={setSelected2}
                  data={busTiming}
                  save="value"
                />
              </View>
            )}
    
            {buttonselected === null && (
              <View style={styles.dropdownContainer}>
                <SelectList
                  data={defaultData1}
                  save="value"
                />
              </View>
            )}
          </View>
    
          {/* pickup gate selection */}
          {buttonselected === 'self' && (
            <View style={styles.headerContainer}> 
              <Text style={styles.header}>Pickup gate selection</Text>
              <Text style={styles.subheader}>Please choose a gate below</Text>
            
              {/* drop down for gate selection */}
              <View style={styles.dropdownContainer}>
                <SelectList 
                  setSelected={setSelected3}
                  data={selfTime === null ? defaultData2 : gateData} 
                  save="key"
                />
              </View>
            </View>
          )}
          
          {/* pickup address */}
          {buttonselected === 'bus' && (
            <View style={styles.headerContainer}> 
              <Text style={styles.header}>Address Confirmation</Text>
              <Text style={styles.subheader}>Use your default address, or enter a new address for drop off</Text>

              {/* default address */}
              <View style={{marginBottom: 10}}>
                <Text style={styles.label}>Default address</Text>
                <TextInput 
                style={styles.input} 
                value={thisChildData.address} 
                editable={false} />
              </View>

              {/* editable address */}
              <Text style={styles.label}>New address</Text>
              <TextInput
                style = {styles.input}
                onChangeText = {setAddress}
                value= {newAddress}
                placeholder='Enter new address'
                />

              <TextInput
                style = {styles.input2}
                onChangeText = {setRegion}
                value= {newRegion}
                placeholder='Region'
                />     
            </View>
          )}
            
          {/* confirm button  */}
          <View style={styles.confirmContainer}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={confirmButton}
            >
              <Text style={styles.btnText}>Confirm</Text>
            </TouchableOpacity> 
          </View>
        </ScrollView>
      </View>
  </KeyboardAvoidingView>
  );
};

export default PickupSelection;

//styling
const styles = StyleSheet.create({
  container: {
      flex: 1,
  },
  dropdownContainer: {
    marginTop: 15
  },
  childHeader: {
    marginHorizontal: 25,
    color: '#56844B',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20
  },
  confirmContainer: {
    marginHorizontal: 30,
  },
  headerContainer: {
    marginTop: 20,
    marginHorizontal: 25
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
  },
  header: {
    fontWeight: 'bold',
    color: '#717171',
    fontSize: 18
  },
  subheader: {
    color: '#999999',
    fontSize: 13,
    marginTop: 5,
  },
  pickupBtn: {
    flex: 1,
    backgroundColor: '#56844B',
    marginTop: 15,
    borderRadius: 8,
    paddingLeft: 15,
    paddingVertical: 15,
    width: '62%',
  },
  pickupText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  leftButton: {
    marginRight: 5,
  },
  rightButton: {
    marginLeft: 5,
  },
  buttonSelect: {
    backgroundColor: '#535353',
  },
  confirmBtn:{
    backgroundColor: '#56844B',
    marginVertical: 30,
    borderRadius:10,
    height:50,
    alignItems:'center',
    marginBottom:30,
  },
  btnText:{
    padding: 15,
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  disabledButton : {
    backgroundColor: '#CCCCCC',
  },
  label: {
    marginVertical: 16,
    marginBottom: 0,
    color: '#56844B',
    fontSize: 15,
    fontWeight: 'bold',
  },
  input: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#E6E6E6',
    height: 40,
  },
  input2: {
    marginTop: 5,
    padding: 7,
    borderRadius: 8,
    backgroundColor: '#E6E6E6',
    height: 35,
    width: '50%',
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