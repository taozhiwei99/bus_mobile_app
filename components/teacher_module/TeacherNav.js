//import libaries
import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeacherHome from './TeacherHome';
import TeacherPickup from './TeacherPickup';
import TeacherBusPickUp from './TeacherBusPickup';
import DriverList from './DriverList';
import TeacherScanQR from './TeacherScanQR';
import { Ionicons, Entypo } from '@expo/vector-icons'
import TeacherProfile from './TeacherProfile';
import TeacherEditProfile from './TeacherEditProfile';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {userLastName} from '../Login';
import TeacherAnnouncements from '../common/TeacherAnnouncements';
import StudentQR from './StudentQR';
import ChatsScreen from '../common/chat_module/screen/ChatsScreen';
import ChatScreen from '../common/chat_module/screen/ChatScreen';
import ViewLocation from '../common/ViewLocation';

//announcement stack screen
const AnnouncementStack = createNativeStackNavigator();

//driver selection stack screen
const DriverSelectionStack = createNativeStackNavigator();

{/* stack navigation between profile and edit profile page */}
const ProfileStack = createNativeStackNavigator();

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
                name="TeacherProfile" 
                component={TeacherProfile}
                options={{
                    title:"Profile"
                }}
            />
            <ProfileStack.Screen 
                name="TeacherEditProfile" 
                component={TeacherEditProfile} 
                options={{
                    title:"Edit Profile"
                }}
            />
        </ProfileStack.Navigator>
    );
}

{/* stack navigation between self pickup and qr scanning page */}
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
                name="TeacherPickup" 
                component={TeacherPickup}
                options={{
                    title:"Self Pick Up"
                }}
            />
            <PickUpStack.Screen 
                name="TeacherScanQR" 
                component={TeacherScanQR} 
                options={{
                    title:"Scanning QR Code"
                }}
            />
        </PickUpStack.Navigator>
    );
}

{/* stack navigation between bus driver list, bus pickup and student qr code page */}
function DriverSelectionStackScreen() {
    return (
        <DriverSelectionStack.Navigator
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
            <DriverSelectionStack.Screen
                name="DriverList" 
                component={DriverList} 
                options={{
                    title:"Driver List"
                }}
            />
            {/* route to bus pick up page */}
            <DriverSelectionStack.Screen
                name="TeacherBusPickup" 
                component={TeacherBusPickUp}
                options={{
                    title:"Bus Pick Up"
                }}
            />
            {/* route to student QR Code page */}
            <DriverSelectionStack.Screen
                name="StudentQR" 
                component={StudentQR} 
                options={{
                    title:"Student QR Code"
                }}
            />
        </DriverSelectionStack.Navigator>
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
          name="TeacherHome" 
          component={TeacherHome}
          options={{
            title: "Welcome, "+ Lname
          }}
        />
        {/* location map */}
        <AnnouncementStack.Screen 
          name="ViewLocation" 
          component={ViewLocation}
          options={{
            title: "Live Locations"
          }}
        />
        {/* page to route to from main */}
        <AnnouncementStack.Screen 
          name="TeacherAnnouncementPage" 
          component={TeacherAnnouncements} 
          options={{
            title:"Announcements"
          }}
        />
      </AnnouncementStack.Navigator>
    );
  }

export default function TeacherNav() {
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
                tabBarLabel: 'Self Pick up',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="account" color={color} size={size} />
                ),
            }} 
        />
        <Tab.Screen 
            name="DriverSelectionStack" 
            component={DriverSelectionStackScreen} 
            options={{
                headerShown: false,
                tabBarLabel: 'Bus Pick up',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="bus" color={color} size={size} />
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