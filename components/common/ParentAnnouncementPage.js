//import libaries
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import axios from 'axios';
import { userSchoolID } from '../Login';

//main parent announcement
const ParentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const thisSchool = userSchoolID;

  useEffect(() => {
    // Fetch top 10 announcements from the API
    axios.get(`https://h4uz91dxm6.execute-api.ap-southeast-1.amazonaws.com/dev/api/parent/announcements/10/${thisSchool}`)
      .then((response) => {
        const receivedAnn = response.data;
        setAnnouncements(receivedAnn);
      })
      .catch((error) => {
        console.log('Error fetching announcements:', error);
      });
  }, []);

  //display
  return (
    <ScrollView style={styles.container}>
      <View style={styles.upperRow}>
        <Text style={styles.header}>News & Notices</Text>
      </View>

      {/* announcement list */}
      <View style={styles.announcements}>
        {announcements.map((announcement) => (
          <View key={announcement.ann_ID}>
            <Card style={styles.card}>
              <Text style={styles.text}> {announcement.message} </Text>
            </Card>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default ParentAnnouncements;

//styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  announcements: {
    marginHorizontal: 20,
    marginTop: 10,
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
  card: {
    backgroundColor: 'lightgrey',
    marginVertical: 10,
    marginHorizontal: 10
  },
  text: {
    color: 'grey',
    marginHorizontal: 10,
    marginVertical: 10,
    fontSize: 14,
    fontWeight: 'bold'
  },
});