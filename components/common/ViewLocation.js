import React, { useEffect, useState , useRef} from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, Text} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import { usernameValue } from '../Login';

export default function LocationDisplay() {
  const route = useRoute();
  const {driverID} = route.params;
  const thisUser = usernameValue;
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  //web socket URL
  const URL = 'wss://nuhyx0cvg8.execute-api.ap-southeast-1.amazonaws.com/prod';
  const socketRef = useRef(null);

  const getLocation = async() => {
    if(!socketRef.current) {
      const connection = {
        action: 'setUsers',
        username: thisUser,
      };

      socketRef.current = new WebSocket(URL);
      socketRef.current.onopen = () => {
        socketRef.current.send(JSON.stringify(connection));
      };

      socketRef.current.onerror = (error) => {
        console.error("Error establishing connection with socket URL!", error);
      };

      socketRef.current.onmessage = (event) => {
        try {
          const receivedMsg = JSON.parse(event.data);
          if (receivedMsg.locationMessage) {
            const [sender, locationData] = receivedMsg.locationMessage.split(': ');
            if (sender === driverID) {
              const [latitude, longitude] =  locationData.split('-').map(parseFloat);
              setLocation ( {
                latitude,
                longitude,
                latitudeDelta: 0.009,
                longitudeDelta: 0.009,
              });
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error("Error establishing connection", error);
        }
      }
    }
  };

  const closeConnection = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }

  useEffect(() => {
    getLocation();

    return () => {
      closeConnection();
    };
  }, []);

  if (!location) {
    return (
      <View style = {styles.loadingContainer}>
        <Text style = {styles.loadingText}>Loading data...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {location && (
          <MapView style={styles.map} initialRegion={location}>
            <Marker coordinate={location} title="Marker" />
          </MapView>
        )}
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
    width: '100%',
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
