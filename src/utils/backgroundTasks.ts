import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendAutomaticSMS } from './smsGateway';

const BACKGROUND_TASK_NAME = 'pet-alert-background-check';
const TIMER_CHECK_TASK = 'timer-check-background';

interface TimerData {
  startTime: number;
  duration: number; // in minutes
  petName: string;
  emergencyContacts: Array<{
    name: string;
    phone: string;
  }>;
  careInstructions: any;
}

// Define the background task for checking timers
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    console.log('Background task running - checking for expired timers');
    
    // Get stored timer data
    const timerDataStr = await AsyncStorage.getItem('activeTimer');
    if (!timerDataStr) {
      console.log('No active timer found');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const timerData: TimerData = JSON.parse(timerDataStr);
    const now = Date.now();
    const endTime = timerData.startTime + (timerData.duration * 60 * 1000);
    
    // Check if timer has expired
    if (now >= endTime) {
      console.log('Timer expired! Sending emergency alerts...');
      
      // Create alarm notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🚨 PET ALERT - TIMER EXPIRED! 🚨",
          body: `URGENT: Your pet safety timer has expired! Emergency contacts are being notified about ${timerData.petName}.`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          sticky: true,
          vibrate: [0, 1000, 500, 1000, 500, 1000],
          categoryIdentifier: 'pet-alert-alarm',
          data: {
            type: 'timer-expired',
            petName: timerData.petName,
          }
        },
        trigger: null, // Immediate
      });

      // Send SMS alerts
      if (timerData.emergencyContacts.length > 0) {
        try {
          const message = `🚨 PET SAFETY ALERT 🚨\n\nThis is an automated emergency alert. ${timerData.petName}'s safety timer has expired and the owner has not checked in.\n\nPlease check on the pet immediately.\n\nContact info: Check directly with the pet owner.\n\nThis alert was sent automatically by the PetSafe app.`;
          
          const smsResult = await sendAutomaticSMS(timerData.emergencyContacts, message);
          
          // Store SMS result for the app to access later
          await AsyncStorage.setItem('lastSmsResult', JSON.stringify({
            success: smsResult.success,
            sentTo: smsResult.sentTo,
            failedTo: smsResult.failedTo,
            message: smsResult.message,
            timestamp: Date.now(),
          }));
          
          console.log('SMS alerts sent:', smsResult);
        } catch (error) {
          console.error('Error sending SMS alerts:', error);
        }
      }

      // Mark timer as alerted
      await AsyncStorage.setItem('timerAlerted', 'true');
      
      // Clear the active timer
      await AsyncStorage.removeItem('activeTimer');
      
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background task
export async function registerBackgroundTask(): Promise<void> {
  try {
    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
    
    if (!isRegistered) {
      console.log('Registering background task...');
      await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: 15000, // 15 seconds minimum
        stopOnTerminate: false, // Continue after app termination
        startOnBoot: true, // Start after device restart
      });
      console.log('Background task registered successfully');
    } else {
      console.log('Background task already registered');
    }
  } catch (error) {
    console.error('Error registering background task:', error);
  }
}

// Store timer data for background checking
export async function storeActiveTimer(
  startTime: number,
  durationMinutes: number,
  petName: string,
  emergencyContacts: Array<{ name: string; phone: string }>,
  careInstructions: any
): Promise<void> {
  try {
    const timerData: TimerData = {
      startTime,
      duration: durationMinutes,
      petName,
      emergencyContacts,
      careInstructions,
    };
    
    await AsyncStorage.setItem('activeTimer', JSON.stringify(timerData));
    await AsyncStorage.removeItem('timerAlerted'); // Reset alert status
    console.log('Timer data stored for background monitoring');
  } catch (error) {
    console.error('Error storing timer data:', error);
  }
}

// Clear stored timer data
export async function clearActiveTimer(): Promise<void> {
  try {
    await AsyncStorage.removeItem('activeTimer');
    await AsyncStorage.removeItem('timerAlerted');
    console.log('Active timer cleared');
  } catch (error) {
    console.error('Error clearing timer data:', error);
  }
}

// Check if timer was alerted in background
export async function wasTimerAlerted(): Promise<boolean> {
  try {
    const alerted = await AsyncStorage.getItem('timerAlerted');
    return alerted === 'true';
  } catch (error) {
    console.error('Error checking timer alert status:', error);
    return false;
  }
}

// Get last SMS result from background task
export async function getLastSmsResult(): Promise<any | null> {
  try {
    const resultStr = await AsyncStorage.getItem('lastSmsResult');
    if (resultStr) {
      return JSON.parse(resultStr);
    }
    return null;
  } catch (error) {
    console.error('Error getting last SMS result:', error);
    return null;
  }
}