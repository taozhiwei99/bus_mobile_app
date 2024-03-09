//import libaries
import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { usernameValue } from '../../../Login';

//message displaying GUI
//to display messages send by user, and messages received
const Message = ({ message }) => {
    const thisUser = usernameValue;
    // define function for whose message it is

    const isPublicMessage = () => {
        return message.msgType === 'publicMessage';
    };

    const isMyMessage = () => {
        return isPublicMessage() && message.sender === thisUser;
    };

    const donotDisplay = () => {
        if (message.msgType === 'systemMessage' && message.message.includes(thisUser)) {
            return false;
        }
        return !isPublicMessage() || (message.sender !=='system');
    };

    if (!donotDisplay()) {
        return null;
    }

    //display
    return (
        <View style={[styles.container, {
            backgroundColor: isMyMessage() ? '#85b678' : '#bc8095',
            alignSelf:isMyMessage() ? 'flex-end' :'flex-start'
        }]}>
            <Text style = {styles.header}>
            {message.sender === thisUser? "me": message.sender}</Text>
            <Text> {message.message} </Text>
            <Text style={styles.time}> {message.timestamp} </Text>
        </View>
    );
};
// styling
const styles = StyleSheet.create({
    container: {
        margin: 5,
        padding: 10,
        borderRadius: 10,
        maxWidth: '80%',

        // text shadows
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.0,
        elevation: 1
    },
    time: {
        color: 'white',
        alignSelf: 'flex-end',
        fontSize: 13,
        marginTop: 2
    },
    header: {
        fontWeight: 'bold',
        textTransform: 'capitalize'
    },
})

export default Message