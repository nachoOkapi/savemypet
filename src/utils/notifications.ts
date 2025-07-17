import * as Notifications from 'expo-notifications';
import * as SMS from 'expo-sms';
import * as Haptics from 'expo-haptics';
import { Platform, Alert } from 'react-native';
import { EmergencyContact } from '../state/petAlertStore';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Create a persistent alarm sound
const createAlarmSound = () => {
  // This will create a louder, more persistent notification sound
  return 'default'; // In a real app, you'd use a custom alarm sound file
};

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
        title: "🚨 PET ALERT - TIMER EXPIRED! 🚨",
        body: "URGENT: Check in now! Your emergency contacts will be notified if you don't respond immediately.",
        sound: createAlarmSound(),
        priority: Notifications.AndroidNotificationPriority.MAX,
        sticky: true,
        vibrate: [0, 500, 200, 500, 200, 500],
        categoryIdentifier: 'pet-alert-alarm',
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

// Function to trigger alarm with haptics and sound
export async function triggerAlarm(): Promise<void> {
  try {
    // Strong haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Create an immediate alarm notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚨 PET ALERT ALARM! 🚨",
        body: "URGENT: Your pet safety timer has expired! Check in immediately!",
        sound: createAlarmSound(),
        priority: Notifications.AndroidNotificationPriority.MAX,
        sticky: true,
        vibrate: [0, 1000, 500, 1000, 500, 1000],
      },
      trigger: null, // Immediate
    });

    // Continue haptic feedback for emphasis
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 500);
    
  } catch (error) {
    console.error('Error triggering alarm:', error);
  }
}

// Function to send SMS to emergency contacts
export async function sendEmergencyAlerts(contacts: EmergencyContact[], userMessage?: string): Promise<void> {
  try {
    // Check if SMS is available
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      console.log('SMS not available, using mock alert');
      return;
    }

    // Prepare contacts with phone numbers
    const phoneNumbers = contacts.map(contact => contact.phone).filter(phone => phone);
    
    if (phoneNumbers.length === 0) {
      console.log('No valid phone numbers found');
      return;
    }

    const defaultMessage = userMessage || formatAlertMessage('Friend');
    
    // Send SMS to all contacts
    const result = await SMS.sendSMSAsync(phoneNumbers, defaultMessage);
    
    if (result.result === 'sent') {
      console.log('Emergency SMS sent successfully to:', contacts.map(c => c.name));
    } else {
      console.log('SMS sending was cancelled or failed');
    }
    
  } catch (error) {
    console.error('Error sending emergency SMS:', error);
    // Fallback to mock alert
    console.log('Fallback: Mock emergency alerts sent to:', contacts.map(c => c.name));
  }
}

export function formatAlertMessage(contactName: string): string {
  const timestamp = new Date().toLocaleString();
  return `🚨 PET ALERT 🚨\n\nHi ${contactName}, this is an automated emergency alert. I haven't checked in as scheduled and may not be able to care for my pets.\n\nPlease:\n1. Check on my pets immediately\n2. Contact me directly\n3. Use your emergency key if needed\n\nTime: ${timestamp}\n\nThis is an automated message from Pet Alert app.`;
}