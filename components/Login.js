//importing libaries
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, 
  TouchableWithoutFeedback, Keyboard,
  Platform,TouchableOpacity,KeyboardAvoidingView } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

//global variables
export let usernameValue = '';
export let userLastName = '';
export let userSchoolID = '';
export let userVendorID = '';
export let parentSub = '';

// login function for all user types
const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  //grab the user type
  const route = useRoute();
  const routeCheck = route.params?.userType;
  const userType = routeCheck || null;

  if (!userType) {
    navigation.navigate('Landing');
    return null;
  }

  // Login function
  const handleLogin = () => {
    //to test in console to see what was being received
    usernameValue = username;

    //create user data object
    const userData = {
      username: username,
      password: password,
    };

    //using axios request for different user type
    if (userType === 'parent') {
      axios
        .post('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/parent/login', userData)
        .then((response) => {
          //console.log("response for parent", response.data);
          if (response.data.success) {
            const userLName = response.data.LName;
            const userSchool = response.data.schoolID;
            const subtier = response.data.subTier;
            userLastName = userLName;
            userSchoolID = userSchool;
            parentSub = subtier;
            navigation.navigate('ScreenNav', {userType});
          } else {
            console.log(response.data.error);
            alert("Invalid username or password!")
          }
        })
        .catch((error) => {
          console.log("Error during login!", error);
        });

    } else if (userType === "teacher") {
      axios
        .post('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/teacher/login', userData)
        .then((response) => {
          if (response.data.success) {
            const userLName = response.data.LName;
            const userSchool = response.data.schoolID;
            userLastName = userLName;
            userSchoolID = userSchool;
            navigation.navigate('ScreenNav', {userType});
          } else {
            console.log(response.data.error);
            alert("Invalid username or password!")
          }
        })
        .catch((error) => {
          console.log("Error during login!", error);
        });
    } else if (userType === "driver") {
      axios
        .post('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/driver/login', userData)
        .then((response) => {
          if (response.data.success) {
            const userLName = response.data.LName;
            const userVendor = response.data.vendorID;
            const thisSchools = response.data.schoolIDs
            userLastName = userLName;
            userVendorID = userVendor;
            userSchoolID = thisSchools;
            navigation.navigate('ScreenNav', {userType});
          } else {
            console.log(response.data.error);
            alert("Invalid username or password!")
          }
        })
        .catch((error) => {
          console.log("Error during login!", error);
        });
    }
  };

  //function to hide keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  //original keyboard view
  /*<KeyboardAvoidingView 
      style={styles.container} 
      behavior="position" 
      keyboardVerticalOffset={0}>*/

  // Display
  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView 
      style={styles.container} 
      behavior= {Platform.OS === 'ios' ? 'position' : 'height'}
      keyboardVerticalOffset={Platform.os === 'ios' ? 0 : -100}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>MARSUPIUM</Text>
        </View>
        <View>
          <Text style={styles.subTitleContainer}>Welcome back.</Text>
        </View>
        <View style={styles.inputView}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              placeholder="Username"
              placeholderTextColor="#56844B"
              onChangeText={(username) => setUsername(username)}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              placeholder="Password"
              placeholderTextColor="#56844B"
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
            />
          </View>
        </View>
        <TouchableOpacity onPress={handleLogin} style={styles.loginBtn}>
          <Text style={styles.btnText}>LOGIN</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Login;

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 50,
    color: '#56844B',
    width: '100%',
  },
  titleContainer: {
    marginTop: 100,
    marginHorizontal: 35,
  },
  subTitleContainer: {
    color: '#56844B',
    marginLeft: 40,
    fontWeight: 'bold',
  },
  inputView: {
    marginVertical: 145,
    borderRadius: 25,
    height: 50,
    marginBottom: 10,
    justifyContent: 'center',
    padding: 20,
    marginHorizontal: 25,
  },
  inputContainer: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#56844B',
    marginBottom: 10,
  },
  inputText: {
    height: 50,
    fontSize: 16,
    color: '#56844B',
  },
  loginBtn: {
    backgroundColor: '#56844B',
    marginVertical: 14,
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 35,
    marginRight: 35,
    marginTop: 100,
    marginBottom: 50,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
  },
});