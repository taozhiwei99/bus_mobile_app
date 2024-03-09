//import libaries
import { StyleSheet, View, SafeAreaView, TextInput, ScrollView, TouchableOpacity} from 'react-native';
import {Avatar, Title, Text, Card} from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import React, { useState, useEffect, useLayoutEffect} from "react";
import axios from 'axios';
import {useRoute} from "@react-navigation/native";
import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';

const ChildProfile = () => {
    //grab the childID
    const route = useRoute();
    //this childID is based on the GUI ID
    const {thisChild} = route.params;
    const iSFocused = useIsFocused();
    const [thisChildData, setThisData] = useState(null);
    const [qrData, setQRCode] = useState();
  
    const fetchData = () => {
      //axios to get child data
      axios
        .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/thischild/${thisChild}`)
        .then((response) => {
          const recData = response.data;
          setThisData(recData);
        })
        .catch((error) => {
          console.log('Error fetching child data:', error);
        });
      //grab qr data
      axios
      .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/qr/generator/${thisChild}`)
      .then((response) => {
        const recQR = response.data;
        setQRCode(recQR);
      })
      .catch((error) => {
        console.log("Error fetching QR data:", error);
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
    
    if (!thisChildData) {
      return (
        <View style={styles.loadingContainer}>
          <Text style = {styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    //file upload funciton
    const fileUpload = async (uri) => {
      if (uri) {
        try {
          const response = await axios.get(uri, { responseType: 'blob' });
          const blob = response.data;
          //set s3 folder name
          const folName = "/child";
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            const fNameBef = uri.split("/ImagePicker/")[1];
            const fName = fNameBef;
            const fType = blob.type;
            
            //upload file to s3
            axios
              .post('https://46heb0y4ri.execute-api.us-east-1.amazonaws.com/dev/api/s3/uploadfile', {
                file: base64String,
                name: fName,
                folderName: folName,
                type: fType,
              })
              .then((res) => {
                const uploadedURI = res.data.imageURL;
                const sendData = {
                  userID : thisChild,
                  newImageURI : uploadedURI,
                };
                //insert profile URI in user database
                axios.put('https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/child/updateImageURI', sendData)
                .then((response) => {
                  setThisData((prevUserData) => ({
                    ...prevUserData,
                    imageURI: uploadedURI,
                  }));
                  alert ('File uploaded successfully!');
                })
                .catch((error) => {
                  console.error("Error updating user image: ", error);
                  alert("An error occurred while changeing image!");
                })
              })
              .catch((err) => {
                alert('Error uploading file');
                console.log(err);
              });
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          alert('Error while reading image:', error);
        }
      } else {
        alert('FILE CANNOT BE EMPTY');
      }
    };
  
    //image picker to select profile picture
    const handleChooseProfilePicture = async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
  
        if (!result.canceled) {
          fileUpload(result.assets[0].uri);
  
        } else {
          console.log('Image picker canceled');
        }
      } catch (error) {
        console.log('Error while picking image:', error);
      }
    };    

  //if user do not have an image, display default image
  const imageSource = thisChildData.imageURI ? { uri: thisChildData.imageURI } : require('../common/picture/default.jpg');

  //display
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.userInfoSection}>
          <Card style={styles.cardDisplay}>
              <View style={{flexDirection: 'row', marginTop: 15}}>
                  <TouchableOpacity onPress={handleChooseProfilePicture}>
                  <Avatar.Image 
                    source={imageSource}
                    size={80}
                  />
                </TouchableOpacity>
                <View style={{marginLeft: 20, marginTop: 10}}>
                    <Title style={styles.title}>{thisChildData.childFirstName} {thisChildData.childLastName}</Title>
                </View>
              </View>
          </Card>

          <View style={styles.information}>
              <Text style={styles.profileInfo}>
                  Profile Information
              </Text>
          </View>

          <View>
            <View style={styles.profileContainer}>
              <Text style={styles.profileTag}>School Name</Text>
              <TextInput 
                style={styles.profileText} 
                value = {thisChildData.school_Name}
                placeholderTextColor='#56844B'
                editable = {false}
              />
            </View>

            <View style={styles.profileContainer}>
              <Text style={styles.profileTag}>Address</Text>
              <TextInput 
                style={styles.profileText} 
                value = {thisChildData.address}
                placeholderTextColor='#56844B'
                editable = {false}
              />
            </View>

            <View style={styles.profileContainer}>
              <Text style={styles.profileTag}>Form Class</Text>
              <TextInput 
                style={styles.profileText} 
                value = {thisChildData.class_Name}
                placeholderTextColor='#56844B'
                editable = {false}
              />
            </View>

            <View style={styles.profileContainer}>
              <Text style={styles.profileTag}>Form Teacher</Text>
              <TextInput 
                style={styles.profileText} 
                value={`${thisChildData.teacherFirstName} ${thisChildData.teacherLastName}`}
                placeholderTextColor='#56844B'
                editable = {false}
              />
            </View>

            <View style={styles.profileContainer}>
              <Text style={styles.profileTag}>Teacher Email</Text>
              <TextInput 
                style={styles.profileText} 
                value = {thisChildData.email}
                placeholderTextColor='#56844B'
                editable = {false}
              />
            </View>

          </View>
              {/* display QR code */}
              <View style={styles.qrContainer}>
                {qrData && thisChildData && (
                  <QRCode
                    value={qrData}
                    color={'#56844B'}
                    backgroundColor={'white'}
                    size={160}
                    logoMargin={2}
                    logoSize={20}
                    logoBorderRadius={10}
                    logoBackgroundColor={'transparent'}
                  />
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

export default ChildProfile;

// styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardDisplay: {
    paddingBottom: 25,
    paddingLeft: 15,
    paddingRight: 130,
    backgroundColor: '#56844B',
    paddingTop: 10,
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
    marginTop: 35
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff'
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
  qrContainer: {
    marginHorizontal: '25%',
    marginTop: 35
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
