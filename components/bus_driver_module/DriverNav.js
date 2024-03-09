//import libaries
import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverHome from './DriverHome';
import DriverPickup from './DriverPickup';
import DriverScanQR from './DriverScanQR';
import { Ionicons, Entypo } from '@expo/vector-icons'
import DriverProfile from './DriverProfile';
import DriverEditProfile from './DriverEditProfile';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DriverAnnouncements from '../common/DriverAnnouncements';
//import the userLastName from login
import {userLastName} from '../Login';
import ChatsScreen from '../common/chat_module/screen/ChatsScreen';
import ChatScreen from '../common/chat_module/screen/ChatScreen';
import ViewLocation from '../common/ViewLocation';

{/* stack navigation between profile and edit profile page */}
const ProfileStack = createNativeStackNavigator();

const AnnouncementStack = createNativeStackNavigator();

// stack navigation for chat screens
const ChatStack = createNativeStackNavigator();

function ProfileStackScreen() {
    return (
        <ProfileStack.Navigator 
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#56844B',
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerBackTitleVisible: false
            }}
        >
            <ProfileStack.Screen 
                name="DriverProfile" 
                component={DriverProfile}
                options={{
                    title:"Profile"
                }}
            />
            <ProfileStack.Screen 
                name="DriverEditProfile" 
                component={DriverEditProfile} 
                options={{
                    title:"Edit Profile"
                }}
            />
        </ProfileStack.Navigator>
    );
}

{/* stack navigation between pickup and qr scanning page */}
const PickUpStack = createNativeStackNavigator();

function PickUpStackScreen() {
    return (
        <PickUpStack.Navigator 
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#56844B',
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerBackTitleVisible: false
            }}
        >
            <PickUpStack.Screen 
                name="DriverPickup" 
                component={DriverPickup}
                options={{
                    title:"Pick Up"
                }}
            />
            <PickUpStack.Screen 
                name="DriverScanQR" 
                component={DriverScanQR} 
                options={{
                    title:"Scanning QR Code"
                }}
            />
        </PickUpStack.Navigator>
    );
}

function AnnouncementStackScreen() {
    //setting last name of user from login
    const Lname = userLastName;
    return (
      <AnnouncementStack.Navigator 
        screenOptions={{
          headerStyle: {
            backgroundColor: '#56844B',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false
        }}
      >
        {/* main page */}
        <AnnouncementStack.Screen 
          name="DriverHome" 
          component={DriverHome}
          options={{
            title: "Welcome, "+ Lname
          }}
        />
        {/* location map */}
        <AnnouncementStack.Screen 
          name="ViewLocation" 
          component={ViewLocation}
          options={{
            title: "Live Location"
          }}
        />
        {/* page to route to from main */}
        <AnnouncementStack.Screen 
          name="DriverAnnouncementPage" 
          component={DriverAnnouncements} 
          options={{
            title:"Announcements"
          }}
        />
      </AnnouncementStack.Navigator>
    );
  }

  // stack navigation between chat pages
function ChatStackScreen() {
    return(
        <ChatStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#56844B',
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerBackTitleVisible: false
            }}
            // initialRouteName='Chats'
        >
            {/* main page */}
            <ChatStack.Screen 
                name="Chats" 
                component={ChatsScreen}
                options={{
                    title:"Chats",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="ios-chatbubbles-sharp" size={size} color={color} />
                    )
                }}
            />
            {/* page to route to from main */}
            <ChatStack.Screen 
                name="Chat Messages" 
                component={ChatScreen} 
                options={{
                    title:"Chat Messages"
                }}
            />
        </ChatStack.Navigator>
    )
}

const Tab = createBottomTabNavigator();

export default function DriverNav() {
    return (
      <Tab.Navigator 
        initialRouteName="Home" 
        screenOptions={{
            headerStyle: {
                backgroundColor: '#56844B'

            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            tabBarActiveTintColor: '#56844B',
        }}
      >
        <Tab.Screen 
            name="Hello"
            component={AnnouncementStackScreen}
            options={{
                headerShown: false,
                tabBarLabel: 'Home',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="home" color={color} size={size} />
                ),
            }} 
        />
        <Tab.Screen 
            name="PickUpStack" 
            component={PickUpStackScreen} 
            options={{
                headerShown: false,
                tabBarLabel: 'Pick up',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="account" color={color} size={size} />
                ),
            }} 
        />
        <Tab.Screen 
            name="Chat" 
            component={ChatStackScreen} 
            options={{
                headerShown: false,
                tabBarLabel: 'Chat',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="chat" color={color} size={size} />
                ),
            }} 
        />
        <Tab.Screen 
            name="ProfileStack" 
            component={ProfileStackScreen} 
            options={{
                headerShown: false,
                tabBarLabel: 'Profile',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="cog" color={color} size={size} />
                ),
            }} 
        />
      </Tab.Navigator>
    );
  }