//import libaries
import React  from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import {Text, Card} from 'react-native-paper'
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import {Alert} from 'react-native';
import { usernameValue } from '../../Login';
import axios from 'axios';

// subscription page
const CancelSubscription = ({navigation}) => {
    const subscription = 'Premium'
    const thisID = usernameValue;

    const cancelButton = () => {
      Alert.alert (
        "Are you sure?",
        "Your subscription will be cancel upon selecting yes",
        [
          {
            text:"NO",
            style: "cancel",
            onPress: () =>  {navigation.navigate("ParentProfile")
          },  
          },
          {
            text: "YES",
            onPress: () => {
              axios
                .put(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/parent/normal/${thisID}`)
                .then((response) => {
                  if (response.data.success) {
                    Alert.alert(
                      "See you",
                      "Your subscription has been canceled successfully!",
                      [
                        {
                          text:"OK",
                          onPress: () => navigation.navigate("ParentProfile"),
                        },
                      ],
                      {cancelable: false}
                    );
                  } else {
                    alert("Subscription cancellation failed, please try again");
                  }
                })
                .catch((error) => {
                  console.log("Error", error);
                  alert("Unexpected error. Please try again!");
                });
            },
          },
        ],
        {cancelable: false}
      );
    };
    
  //display
  return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerText}> Your plan </Text>
        </View>

        {/* current plan details */}
        <Card style={styles.cardDisplay}>
          <View style={styles.cardText}>
            <Text style={styles.text1}>Marsupium {subscription}</Text>
            <Text style={styles.price}>$49.99 /mth</Text>
            <Text style={styles.text2}>{subscription} Account</Text>
          </View>
          {/*  premium plan benefits */}
          <View style={{backgroundColor: '#5c3542',marginHorizontal: 15, marginBottom: 10, marginTop: 10}}>
                <View style={{flexDirection: 'row'}}>
                  <Icon name="check" size={24} style={{color: '#c4879d'}}/>
                  <Text style={{color: '#c4879d', fontWeight: 'bold', marginTop: 3, fontSize: 15}}> Pick up time slot selection </Text>
                </View>

                <View style={{flexDirection: 'row'}}>
                  <Icon name="check" size={24} style={{color: '#c4879d'}}/>
                  <Text style={{color: '#c4879d', fontWeight: 'bold', marginTop: 3, fontSize: 15}}> Car self pick up services </Text>
                </View>

                <View style={{flexDirection: 'row'}}>
                  <Icon name="check" size={24} style={{color: '#c4879d'}}/>
                  <Text style={{color: '#c4879d', fontWeight: 'bold', marginTop: 3, fontSize: 15}}> Bus pick up services </Text>
                </View>
              </View>
        </Card>

        <Text style={styles.headerText} > Want to change your plan? </Text>
        <View>
            <Card style={styles.cardDisplay2}>
                    <View>
                        <Text style={styles.text3}>Marsupium Normal </Text>
                        <Text style={styles.price2}>Free</Text>
                        <Text style={styles.text4}>Don't worry, you can still pick up your child... by yourself!</Text>

                        {/* basic plan benefits */}
                        <View style={{backgroundColor: '#56844B'}}>
                            <View style={{flexDirection: 'row'}}>
                                <Icon name="check" size={24} style={{color: '#e8ffe3'}}/>
                                <Text style={{color: '#e8ffe3', fontWeight: 'bold', marginTop: 3, fontSize: 15}}> Pick up time slot selection </Text>
                            </View>

                            <View style={{flexDirection: 'row'}}>
                                <Icon name="check" size={24} style={{color: '#e8ffe3'}}/>
                                <Text style={{color: '#e8ffe3', fontWeight: 'bold', marginTop: 3, fontSize: 15}}> Car self pick up services </Text>
                            </View>

                            <View style={{flexDirection: 'row'}}>
                                <Icon name="block-helper" size={20} style={{color: '#e8ffe3', marginTop: 5, marginLeft: 2}}/>
                                <Text style={{color: '#e8ffe3', fontWeight: 'bold', marginTop: 5, fontSize: 15, marginLeft: 3}}> Bus pick up services </Text>
                            </View>
                        </View>
                    </View>
            </Card>

            {/* payment button */}
            <TouchableOpacity onPress={cancelButton} style={styles.paymentBtn}>
                <Text style={styles.btnText}>Cancel Premium</Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
  );
};

export default CancelSubscription;

// styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff'
  },
  headerText: {
    marginVertical: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5c3542'
  },
  headerText2: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#56844B',
    marginBottom: 8
  },
  cardDisplay: {
    paddingBottom: 15,
    backgroundColor: '#5c3542',
    paddingTop: 15,
    paddingLeft: 5
  },
  cardDisplay2: {
    paddingBottom: 25,
    backgroundColor: '#56844B',
    paddingTop: 25,
    paddingLeft: 20
  },
  cardText: {
    margin: 5,
    marginHorizontal: 15
  },
  text1: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10
  },
  price: {
    color: '#c4879d',
    fontWeight: 'bold',
    fontSize: 30,
    marginBottom: 10
  },
  text2: {
    color: '#ffffff',
  },
  text3: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 10
  },
  text4: {
    color: '#ffffff',
    marginBottom: 20,
  },
  text5: {
    color: '#56844B',
    marginBottom: 20,
    marginHorizontal: 5
  },
  price2: {
    color: '#e8ffe3',
    fontWeight: 'bold',
    fontSize: 30,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  dropdownContainer: {
    marginBottom: 10
  },
  textLabel: {
    marginBottom: 5,
    fontWeight: '700'
  },
  paymentBtn:{
    backgroundColor: '#56844B',
    marginVertical: 14,
    borderRadius: 10,
    height: 50,
    alignItems:'center',
    marginTop: 20,
    marginBottom: 50,
  },
  btnText:{
    padding: 15,
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold'
  },
});
