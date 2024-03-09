import React, { useEffect, useState, useRef} from 'react';
import { View, TextInput, ImageBackground, StyleSheet, FlatList, Keyboard, 
  TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import bg from '../../picture/BG.png';
import Message from '../message/message';
import { useNavigation } from '@react-navigation/native';
import { usernameValue, userSchoolID } from '../../../Login';
import AsyncStorage from '@react-native-async-storage/async-storage';

//main chat function
const ChatScreen = ({ route }) => {
  const navigation = useNavigation();
  //socket ref to use same connectionID 
  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const thisUser = usernameValue;
  const thisschools = userSchoolID;
  const schoolArray = Array.isArray(thisschools) ? thisschools : [thisschools];
  const [outboundMsg, setOutboundMsg] = useState('');
  const [displayMsg, setDisplayMsg] = useState([]);
  const [newMsg, setnewMsg] = useState(false);
  //web socket URL
  const URL = 'wss://nuhyx0cvg8.execute-api.ap-southeast-1.amazonaws.com/prod';

  const setConnection = async () => {
    if (!socketRef.current) {
      try {
        let schoolNames;
        if (Array.isArray(thisschools)) {
          schoolNames = thisschools.join('--');
        } else {
          schoolNames = thisschools;
        }
        const connection = {
          action: 'setName',
          name: `${thisUser}--${schoolNames}`,
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

            if (receivedMsg.systemMessage) {
              if (schoolArray.some(school => receivedMsg.systemMessage.includes(school))) {
                const [senderSchool, message] = receivedMsg.systemMessage.split(' has');
                const sender = senderSchool.split('--')[0];
                const systemMsg = {
                  msgType: 'systemMessage',
                  sender: 'system',
                  message: `${sender} has${message}`,
                  timestamp: new Date().toLocaleDateString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })
                };
                setDisplayMsg(prevMsg => [...prevMsg, systemMsg]);
              }
            } else if (receivedMsg.publicMessage) {
                const [senderSchool, message] = receivedMsg.publicMessage.split(": ");
                const sender = senderSchool.split("--")[0];
                if (schoolArray.some(school => senderSchool.includes(school))) {
                  const publicMsg = { 
                  msgType: "publicMessage",
                  sender: sender,
                  message: message,
                  timestamp: new Date().toLocaleDateString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })
                };
                setDisplayMsg(prevMsg => [...prevMsg, publicMsg]);
              }
            }
          } catch (error) {
            console.error("Error receiving data:", error);
          }
        };
      } catch (error) {
        console.error("Error establishing connection", error);
      }
    }
  };

  //close the websocket connection
  const closeConnect = () => {
    if (socketRef.current) {
        socketRef.current.close();
    }
  };

  useEffect(() => {
    setConnection();
    navigation.setOptions({ title: route.params.name });
    loadData();

    return () => {
        closeConnect();
    };
  }, []);

  useEffect(() => {
    if (newMsg) {
      flatListRef.current.scrollToEnd();
      setnewMsg(false);
    }
  }, [newMsg]);

  useEffect(() => {
    saveData();
  }, [displayMsg]);

  //save data to local storage
  const saveData = async() => {
    try {
      await AsyncStorage.setItem('displayMsg', JSON.stringify(displayMsg));
    } catch (error) {
      console.error("Error saving data", error);
    }
  };

  //load local storage data
  const loadData = async () => {
    try {
      const saveData = await AsyncStorage.getItem('displayMsg');
      if (saveData) {
        setDisplayMsg(JSON.parse(saveData));
      }
    } catch (error) {
      console.error("Error loading data", error);
    }
  };

  //send message function
  const onSend = async () => {
    if (outboundMsg.trim() === '') {
      return;
    }

    try {
      const messageData = {
        action: 'sendPublic',
        message: outboundMsg,
      };
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(messageData));
        setOutboundMsg('');
      } else {
        console.error("WebSocket connection is not open.");
      }
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  //dismiss keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  //display
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ImageBackground source={bg} style={styles.bg}>
          <FlatList
            ref={flatListRef}
            data={displayMsg}
            renderItem={({ item }) => <Message message={item} />}
            style={styles.list}
            keyExtractor={(item, index) => index.toString()}
            onContentSizeChange={() => {
              flatListRef.current.scrollToEnd();
            }}
          />
          <View style={styles.inputbox}>
            <View style={styles.container}>
              <TextInput
                placeholder='Type your message here'
                value={outboundMsg}
                onChangeText={setOutboundMsg}
                style={styles.input}
              />
              <MaterialIcons
                onPress={onSend}
                name='send'
                size={18}
                color='white'
                style={styles.send}
              />
            </View>
          </View>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// styling
const styles = StyleSheet.create({
    bg: {
        flex: 1
    },
    list: {
        padding: 10,
    },
    inputbox: {
        marginTop: 'auto',
  },
    container: {
        flexDirection: 'row',
        backgroundColor: 'whitesmoke',
        padding: 10,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: 'white', 
        marginHorizontal: 10,
        paddingHorizontal: 10,
        padding: 5,
        borderRadius: 50,
        borderColor: 'lightgray',
        borderWidth: StyleSheet.hairlineWidth

    },
    send: {
        backgroundColor: 'royalblue',
        padding: 6,
        borderRadius: 15,
        overflow: 'hidden',
    },
});
export default ChatScreen;