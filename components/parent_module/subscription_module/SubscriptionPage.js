//import libaries
import React, { useState }  from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import {Text, Card} from 'react-native-paper'
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { SelectList } from 'react-native-dropdown-select-list'
import {Alert} from 'react-native';
import { usernameValue } from '../../Login';
import axios from 'axios';

// subscription page
const Subscriptionpage = ({navigation}) => {
    const subscription = 'Normal'
    const [selected, setSelected] = React.useState(null);
    const [selected2, setSelected2] = React.useState(null);
    const thisCard = selected;
    const thisCountry = selected2;
    const thisID = usernameValue;

    const cardType = [
      {key:'1', value:'Visa'},
      {key:'2', value:'Mastercard'},
      {key:'3', value:'Amex'},
    ]

    const country = [
      {key:'1', value:'Singapore'},
      {key:'2', value:'Australia'},
      {key:'3', value:'Malaysia'},
      {key:'4', value:'Thailand'},
    ]

    const [firstName, setFName] = useState("");
    const [lastName, setLName] = useState("");
    const [cardNo, setCardNo] = useState("");
    const [expireDate, setExpire] = useState("");
    const [CVV, setCVV] = useState("");

    //function to pay
    const payButton = () => {
      if (
        thisCard !== null &&
        thisCountry !== null &&
        firstName.trim() !== '' &&
        lastName.trim() !== '' &&
        cardNo.trim() !== '' &&
        expireDate.trim() !== '' &&
        CVV.trim() !== ''
      ) {
        axios
          .put(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/parent/prem/${thisID}`)
          .then((response) => {
            if (response.data.success) {
              Alert.alert(
                "Thank you!",
                "Welcome to the premium club!",
                [
                  {
                    text: "OK",
                    onPress: () => navigation.navigate("ParentProfile")
                  }
                ],
                { cancelable: false }
              );
            } else {
              alert("Subscription failed. Please try again!");
            }
          })
          .catch((error) => {
            console.log("Error:", error);
            alert("An error occurred. Please try again!");
          });
      } else {
        alert("Please fill in the right details");
      }
    };

  //display
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView style={styles.container}>
          <View style={styles.header}>
              <Text style={styles.headerText}> Your plan </Text>
          </View>

          {/* current plan details */}
          <Card style={styles.cardDisplay}>
            <View style={styles.cardText}>
              <Text style={styles.text1}>Marsupium {subscription}</Text>
              <Text style={styles.price}>Free</Text>
              <Text style={styles.text2}>{subscription} Account</Text>
            </View>

              {/*  basic plan benefits */}
              <View style={{backgroundColor: '#56844B', marginHorizontal: 15, marginBottom: 10, marginTop: 10}}>
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
          </Card>

          <Text style={styles.headerText} > Want to change your plan? </Text>
          <View>
            <Card style={styles.cardDisplay2}>
              <View>
                <Text style={styles.text3}> Marsupium Premium </Text>
                <Text style={styles.price2}>$49.99 /mth</Text>
                <Text style={styles.text4}>Upgrade to premium to get these perks!</Text>

                {/*  premium plan benefits */}
                <View style={{backgroundColor: '#5c3542'}}>
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
              </View>
            </Card>

            <View>
            {/* payment info */}
              <View>
                <Text style={styles.headerText2}> Pay with credit or debit card </Text>
                <Text style={styles.text5}>All transactions are secure and encrypted.</Text>
                <Text style={styles.textLabel}>Card Type</Text>
                <View style={styles.dropdownContainer}>
                  <SelectList 
                    setSelected={setSelected}
                    data={cardType} 
                    save="value"
                  />
                </View>

                <Text style={styles.textLabel}>Country</Text>
                <View style={styles.dropdownContainer}>
                  <SelectList 
                    setSelected = {setSelected2}
                    data={country} 
                    save="value"
                  />
                </View>

                <Text style={styles.textLabel}>First Name</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={setFName}
                  value={firstName}
                  placeholder="Card Holder's First Name"

                />
                <Text style={styles.textLabel}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={setLName}
                  value={lastName}
                  placeholder="Card Holder's First Name"
                />

                <Text style={styles.textLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={setCardNo}
                  value={cardNo}
                  placeholder="Card Number"
                  keyboardType="numeric"
                />

                <Text style={styles.textLabel}>Expiry Date</Text>
                <View>
                  <TextInput
                    style={styles.input}
                    onChangeText={setExpire}
                    value={expireDate}
                    placeholder="Expiry date (MM/YY)"
                  />

                  <Text style={styles.textLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={setCVV}
                    value={CVV}
                    placeholder="Security Code"
                    keyboardType="numeric"
                  />
                </View>
              </View>
                  {/* payment button */}
                  <TouchableOpacity onPress={payButton} style={styles.paymentBtn}>
                      <Text style={styles.btnText}>Pay</Text>
                  </TouchableOpacity>
                  </View>
              </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Subscriptionpage;

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
    backgroundColor: '#56844B',
    paddingTop: 15,
    paddingLeft: 5
  },
  cardDisplay2: {
    paddingBottom: 25,
    backgroundColor: '#5c3542',
    paddingTop: 25,
    paddingHorizontal: 15
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
    color: '#e8ffe3',
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
    color: '#c4879d',
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
    marginTop: 10,
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
