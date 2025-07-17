import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TimerScreen from '../screens/TimerScreen';
import ContactsScreen from '../screens/ContactsScreen';

export type RootStackParamList = {
  Timer: undefined;
  Contacts: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Timer"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="Timer" 
        component={TimerScreen}
      />
      <Stack.Screen 
        name="Contacts" 
        component={ContactsScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}