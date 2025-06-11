import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import OtpScreen from '../screens/OtpScreen';
import MeterReadingScreen from '../screens/MeterReadingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="MeterReading" component={MeterReadingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;