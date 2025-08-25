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

export async function scheduleTimerNotification(
  durationMinutes: number,
  petName: string = 'Your Pet'
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Schedule the primary notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚨 PET ALERT - TIMER EXPIRED! 🚨",
        body: `URGENT: Check in now! Your emergency contacts will be notified about ${petName} if you don't respond immediately.`,
        sound: createAlarmSound(),
        priority: Notifications.AndroidNotificationPriority.MAX,
        sticky: true,
        vibrate: [0, 500, 200, 500, 200, 500],
        categoryIdentifier: 'pet-alert-alarm',
        data: {
          type: 'timer-expired',
          petName: petName,
        }
      },
      trigger: {
        seconds: durationMinutes * 60,
      },
    });

    // Schedule additional reminder notifications for critical alerts
    if (durationMinutes >= 60) { // For timers 1 hour or longer
      // Schedule a reminder 5 minutes before expiry
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ Pet Safety Timer - 5 Minutes Left",
          body: `Your pet safety timer for ${petName} expires in 5 minutes. Don't forget to check in!`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: (durationMinutes - 5) * 60,
        },
      });
    }

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

// Function to send SMS to emergency contacts using automatic SMS gateway
export async function sendEmergencyAlerts(contacts: EmergencyContact[], userMessage?: string, petName?: string, careInstructions?: any): Promise<{ success: boolean; message: string; sentTo: string[]; failedTo: string[] }> {
  // Import the SMS gateway function
  const { sendAutomaticSMS } = await import('./smsGateway');
  
  try {
    const defaultMessage = userMessage || formatAlertMessage('{contactName}', petName, careInstructions);
    
    // Send SMS automatically using gateway
    const result = await sendAutomaticSMS(contacts, defaultMessage);
    
    if (result.success) {
      console.log('Emergency SMS sent successfully to:', result.sentTo);
    } else {
      console.log('SMS sending failed:', result.message);
    }
    
    return result;
    
  } catch (error) {
    console.error('Error sending emergency SMS:', error);
    return {
      success: false,
      message: `SMS sending error: ${error.message}`,
      sentTo: [],
      failedTo: contacts.map(c => c.phone)
    };
  }
}

// Fallback function for native SMS composer (requires user interaction)
export async function sendEmergencyAlertsNative(contacts: EmergencyContact[], userMessage?: string): Promise<void> {
  try {
    // Check if SMS is available
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      console.log('SMS not available');
      return;
    }

    // Prepare contacts with phone numbers
    const phoneNumbers = contacts.map(contact => contact.phone).filter(phone => phone);
    
    if (phoneNumbers.length === 0) {
      console.log('No valid phone numbers found');
      return;
    }

    const defaultMessage = userMessage || formatAlertMessage('Friend');
    
    // Send SMS to all contacts (opens native SMS app)
    const result = await SMS.sendSMSAsync(phoneNumbers, defaultMessage);
    
    if (result.result === 'sent') {
      console.log('Emergency SMS sent successfully to:', contacts.map(c => c.name));
    } else {
      console.log('SMS sending was cancelled or failed');
    }
    
  } catch (error) {
    console.error('Error sending emergency SMS:', error);
  }
}

export function formatAlertMessage(contactName: string, petName?: string, careInstructions?: any): string {
  const timestamp = new Date().toLocaleString();
  let message = `🚨 PET ALERT 🚨\n\nHi ${contactName}, this is an automated emergency alert. I haven't checked in as scheduled and may not be able to care for ${petName || 'my pet'}.\n\nPlease:\n1. Check on ${petName || 'my pet'} immediately\n2. Contact me directly\n3. Use your emergency key if needed\n\n`;

  // Add care instructions if available
  if (careInstructions) {
    if (careInstructions.foodType || careInstructions.feedingTimes?.length) {
      message += `FEEDING:\n`;
      if (careInstructions.foodType) message += `• Food: ${careInstructions.foodType}\n`;
      if (careInstructions.foodAmount) message += `• Amount: ${careInstructions.foodAmount}\n`;
      if (careInstructions.feedingTimes?.length) message += `• Times: ${careInstructions.feedingTimes.join(', ')}\n`;
      if (careInstructions.feedingNotes) message += `• Notes: ${careInstructions.feedingNotes}\n`;
      message += `\n`;
    }

    if (careInstructions.medications?.length) {
      message += `MEDICATIONS:\n`;
      careInstructions.medications.forEach(med => {
        message += `• ${med.name}`;
        if (med.dosage) message += ` - ${med.dosage}`;
        if (med.timing) message += ` (${med.timing})`;
        message += `\n`;
      });
      message += `\n`;
    }

    if (careInstructions.vetName || careInstructions.vetPhone) {
      message += `VET INFO:\n`;
      if (careInstructions.vetName) message += `• ${careInstructions.vetName}\n`;
      if (careInstructions.vetPhone) message += `• ${careInstructions.vetPhone}\n`;
      message += `\n`;
    }

    if (careInstructions.emergencyNotes) {
      message += `EMERGENCY NOTES:\n${careInstructions.emergencyNotes}\n\n`;
    }
  }

  message += `Time: ${timestamp}\n\nThis is an automated message from Pet Alert app.`;
  
  return message;
}