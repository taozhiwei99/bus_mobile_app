//import libaries
import React, { useEffect, useState, useLayoutEffect } from "react";
import { StyleSheet, View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import axios from 'axios';
import {useIsFocused, useRoute } from '@react-navigation/native';

//main for student QR
const StudentQR = () => {
    const route = useRoute();
    const {childID, childfName} = route.params;
    const iSFocused = useIsFocused();
    const [childQR, setChildQR] = useState();

    const fetchData = () => {
        //axios request to get child QR
        axios
            .get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/qr/generator/${childID}`)
            .then((response) => {
                const recChildQR = response.data;
                if(recChildQR && recChildQR.length >0) {
                    setChildQR(recChildQR);
                } else {
                    setChildQR();
                }
            })
            .catch((error) => {
                console.log("Error fetching child QR", error);
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
      
      //buffer
      if (!childQR) {
        return (
          <View style={styles.loadingContainer}>
            <Text style = {styles.loadingText}>Loading...</Text>
          </View>
        );
      }
    
    //display
    return (
        <View style={styles.container}>
            <View>
              <Text style={styles.childHeader}>QR Code For Student: {childfName}</Text>
            </View>
            <View style={styles.qrContainer}>
            {childQR && (
                <QRCode
                    value={childQR}
                    color={'#56844B'}
                    backgroundColor={'white'}
                    size={300}
                    logoMargin={2}
                    logoSize={20}
                    logoBorderRadius={10}
                    logoBackgroundColor={'transparent'}
                />
            )}    
            </View>
        </View>
    );
}

export default StudentQR;

// styling
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
    childHeader: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20
      },
    qrContainer: {
        marginHorizontal: '30%',
        marginTop: 150
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