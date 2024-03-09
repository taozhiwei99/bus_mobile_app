//importing libaries
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './components/Login';
import TeacherNav from './components/teacher_module/TeacherNav';
import ParentNav from './components/parent_module/ParentNav';
import DriverNav from './components/bus_driver_module/DriverNav';
import LandingPage from './components/common/LandingPage';

//creating a stack navigator
const Stack = createStackNavigator();

//navigator based on usertype
const ScreenNav = ({ route }) => {
  const {userType} = route.params;
  if (userType === 'parent') {
    return <ParentNav />;
  } else if (userType === 'teacher') {
    return <TeacherNav />;
  } else if (userType === 'driver') {
    return <DriverNav />;
  } else {
    return <p>Invalid User Type</p>;
  }
};

//default navigator 
export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen
          name="Landing"
          component={LandingPage}
          options={{
            title: "",
            headerStyle: {
              backgroundColor: "#56844B"
            }
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: "",
            headerShown: false,
            headerStyle: {
              backgroundColor: "#56844B"
            }
          }}
        />
        <Stack.Screen
          name="ScreenNav"
          component={ScreenNav}
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
