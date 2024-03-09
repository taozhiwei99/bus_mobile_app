import {FlatList } from 'react-native';
import ChatListItem from '../components/ChatItem';

// ChatScreen displays the ChatItem
const ChatsScreen = () => {
    //hard coded public channel
    const chat = [
        {
            id: 1,
            name: 'Public Chat',
            lastMessage: {
                id: 1,
                text: 'This is the public chat channel!',
                receivedAt: '',
            }
        }
    ]
    
    return (
        // calls the styled chat box from chat item and passes through a flat list
        // with params to display above past chat details
        <FlatList
            data={chat}
            renderItem={({item}) => <ChatListItem chat={item} />}
            style={{marginTop: 10}}
        />
    );
};

export default ChatsScreen;