import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { EmergencyContact } from '../state/petAlertStore';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('pet-alerts', {
        name: 'Pet Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function scheduleTimerNotification(durationMinutes: number): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Pet Alert Timer Expired!",
        body: "Time to check in! Your emergency contacts will be notified if you don't respond.",
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        sticky: true,
      },
      trigger: {
        seconds: durationMinutes * 60,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

// Mock function to simulate sending alerts to emergency contacts
// In a real app, this would integrate with SMS/email services
export function sendEmergencyAlerts(contacts: EmergencyContact[], userMessage?: string): Promise<void> {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      console.log('Emergency alerts sent to:', contacts.map(c => c.name));
      resolve();
    }, 1000);
  });
}

export function formatAlertMessage(contactName: string): string {
  return `Hi ${contactName}, this is an automated Pet Alert. I haven't checked in as scheduled. Please check on my pets or contact me directly. This alert was sent because I may not be able to care for my pets right now.`;
}