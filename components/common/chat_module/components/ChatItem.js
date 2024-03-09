//import libaries
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {Avatar} from 'react-native-paper'
import React from 'react';

// ChatListItem is to display the chat messages on main chat page 
const ChatListItem = ({ chat }) => {
    const navigation = useNavigation();
    //display
    return(
        <TouchableOpacity 
        onPress={() => {  
        navigation.navigate('Chat Messages', 
        { id: chat.id, name: chat.name})}} style={styles.container}>
            <Avatar.Image
            source={require('../../picture/default.jpg')}
            size={60}
            />

            <View style={styles.content}>
                {/* user name and time */}
                <View style={styles.row}>
                    <Text style={styles.name} numberOfLines={1}>
                        {chat.name}
                    </Text>
                    <Text style={styles.subTitle}>
                        {chat.lastMessage.receivedAt}
                    </Text>
                </View>

                {/* message */}
                <Text numberOfLines={2} style={styles.subTitle}>
                    {chat.lastMessage.text}
                </Text>
            </View>
        </TouchableOpacity>
    )
};
// styling
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginVertical: 5,
        height: 70
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 10,
    },
    content: {
        flex: 1,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'lightgray'
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5
    },
    name: {
        flex: 1,
        fontWeight: 'bold',
        color: '#844b5f'
    },
    subTitle: {
        color: 'gray',
        marginRight: 7
    },
})

export default ChatListItem;
