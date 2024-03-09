//import libaries
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';

//pass usertype to login page
const LandingPage = ({navigation}) => {
  const typeHandler = (type) => {
    if (type) {
      navigation.navigate('Login', {userType: type});
    }
  };

  //display
  return (
    <View>
       <Text style={styles.textHeader}>
        I am a...
       </Text>
       <Text style={styles.textCaption}>
        Please select a user profile 
       </Text>

       {/* button for parents */}
       <View style={styles.buttonGroup}>
        <TouchableOpacity onPress={() => typeHandler('parent')}>
          <View style={styles.buttonText}>
            <Text style={styles.buttonHeader}>PARENT</Text>
            <Text style={styles.buttonCaption}>Parents/guardian of the child</Text>
          </View>
        </TouchableOpacity>
       </View>

       {/* button for teachers */}
       <View style={styles.buttonGroup}>
        <TouchableOpacity onPress={() => typeHandler('teacher')}>
          <View style={styles.buttonText}>
            <Text style={styles.buttonHeader}>TEACHER</Text>
            <Text style={styles.buttonCaption}>Teachers in-charge of dismissal</Text>
          </View>
        </TouchableOpacity>
       </View>

       {/* button for drivers */}
       <View style={styles.buttonGroup}>
        <TouchableOpacity onPress={() => typeHandler('driver')}>
          <View style={styles.buttonText}>
            <Text style={styles.buttonHeader}>DRIVER</Text>
            <Text style={styles.buttonCaption}>Bus driver for child pickup</Text>
          </View>
        </TouchableOpacity>
       </View>
    </View>
  );
}

export default LandingPage;

//styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textHeader: {
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 30,
    fontSize: 17,
    color: '#56844B'
  },
  textCaption: {
    color: '#545454',
    marginLeft: 20,
    fontWeight: '300'
  },
  buttonGroup: {
    marginHorizontal: 20,
    marginTop: 30,
    borderBottomColor: '#56844B',
    borderBottomWidth: 1
  },
  buttonHeader: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#56844B'
  },
  buttonCaption: {
    marginVertical: 10
  },
});