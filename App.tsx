import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AppNavigator from "./src/navigation/AppNavigator";
import { handleNotificationResponse } from './src/utils/reliableNotifications';

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  useEffect(() => {
    // Initialize notification handling
    const initializeApp = async () => {
      try {
        // Set up notification categories for iOS
        await Notifications.setNotificationCategoryAsync('pet-alert-alarm', [
          {
            identifier: 'check-in',
            buttonTitle: 'Check In',
            options: {
              opensAppToForeground: true,
            },
          },
          {
            identifier: 'send-sms',
            buttonTitle: 'Alert Contacts',
            options: {
              opensAppToForeground: false,
            },
          },
        ]);
        
        // Set up notification response handler
        const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
        
        console.log('App initialization complete');
        
        return () => {
          subscription.remove();
        };
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
