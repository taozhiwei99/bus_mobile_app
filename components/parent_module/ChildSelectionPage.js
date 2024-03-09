//import libaries
import { StyleSheet, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import {Avatar, Title, Text, Card} from 'react-native-paper'
import React, { useState, useEffect, useLayoutEffect} from "react";
import { usernameValue } from '../Login';
import axios from 'axios';
import { useIsFocused } from "@react-navigation/native";

const ChildSelection = ({navigation}) => {
  const [childData, setChildData] = useState([]);
  const username = usernameValue;
  const isFocused = useIsFocused();

  const fetchData = () => {
    //axios to get child for the parent
    axios
      .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/child/${username}`)
      .then((response) => {
        const recData = response.data;
        setChildData(recData);
      })
      .catch((error) => {
        console.log('Error fetching child data:', error);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useLayoutEffect(() => {
    if (isFocused)  { 
      fetchData();
    }
  }, [isFocused]);
  
  if (!childData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style = {styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  //display
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.userInfoSection}>
          <View style={styles.headerContainer}>
              <Text style={styles.header}>Child Pickup Selection</Text>
              <Text style={styles.subheader}>Please select a profile you would like to choose a pickup slot for</Text>
          </View>
          
          <View>
            {childData.map((child) => {
              return (
                <TouchableOpacity
                  style={styles.logoutBtn}
                  key={child.child_ID}
                  onPress={() => {
                    console.log('Pressed child_ID:', child.child_ID);
                    navigation.navigate('PickupSelection', { thisChild: child.child_ID });
                  }}
                >
                  <Card style={styles.cardDisplay}>
                    <View style={{ flexDirection: 'row', marginTop: 15 }}>
                      <Avatar.Image 
                      source={child.imageURI ? { uri: child.imageURI } : require('../common/picture/default.jpg')}
                      size={80} />
                      <View style={{ marginLeft: 20, marginTop: 10 }}>
                        <Title style={styles.title}>
                          {child.firstName} {child.lastName}
                        </Title>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChildSelection;

// styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 20
  },
  header: {
    fontWeight: 'bold',
    color: '#56844B',
    fontSize: 18
  },
  subheader: {
    color: '#999999',
    fontSize: 13,
    marginTop: 5,
  },
  cardDisplay: {
    paddingBottom: 25,
    paddingLeft: 15,
    paddingRight: 130,
    backgroundColor: '#56844B',
    paddingTop: 10,
    marginBottom: 20
  },
  profileInfo: {
    color: '#56844B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  information :{
    marginTop: 35,
    marginBottom: 10,
  },
  profileContainer: {
    marginTop: 10,
    flexDirection: 'row'
  },
  profileTag:{
    color: '#707070',
    fontWeight: 'bold',
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 22,
    fontSize: 15,
    marginRight: 15
  },
  profileText:{
    height:50,
    borderBottomWidth: 1,
    borderBottomColor: '#56844B',
    flex: 2.5,
    justifyContent: 'flex-end',
    color: '#56844B',
    marginTop: 8,
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
    marginTop: 25
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase'
  },
  caption: {
    fontSize: 15,
    lineHeight: 14,
    fontWeight: '500',
    color: '#ffffff'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoBoxWrapper: {
    borderBottomColor: '#dddddd',
    borderBottomWidth: 1,
    borderTopColor: '#dddddd',
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 100,
  },
  btnText:{
      padding: 15,
      color: '#FFFFFF',
      fontSize: 18,
      textAlign: 'center',
      fontWeight: 'bold'
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
