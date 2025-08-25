import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendAutomaticSMS } from './smsGateway';

// Enhanced notification system that works without background fetch
export async function scheduleRobustTimerNotification(
  durationMinutes: number,
  petName: string,
  emergencyContacts: Array<{ name: string; phone: string }>,
  careInstructions: any
): Promise<string[]> {
  const notificationIds: string[] = [];
  
  try {
    // Store timer data for notification handler
    const timerData = {
      petName,
      emergencyContacts,
      careInstructions,
      startTime: Date.now(),
      duration: durationMinutes,
    };
    
    await AsyncStorage.setItem('pendingTimer', JSON.stringify(timerData));
    
    // Schedule main expiry notification
    const mainNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚨 PET ALERT - TIMER EXPIRED! 🚨",
        body: `URGENT: Check in now! Your emergency contacts will be notified about ${petName} if you don't respond.`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        sticky: true,
        vibrate: [0, 1000, 500, 1000, 500, 1000],
        categoryIdentifier: 'pet-alert-alarm',
        data: {
          type: 'timer-expired',
          petName,
          emergencyContacts: JSON.stringify(emergencyContacts),
          careInstructions: JSON.stringify(careInstructions),
        }
      },
      trigger: {
        seconds: durationMinutes * 60,
      },
    });
    
    notificationIds.push(mainNotificationId);
    
    // Schedule progressive alert notifications (every 5 minutes for 30 minutes)
    for (let i = 1; i <= 6; i++) {
      const alertTime = (durationMinutes * 60) + (i * 5 * 60); // 5, 10, 15, 20, 25, 30 minutes after expiry
      
      const followUpId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚨 PET ALERT - ${i * 5} MINUTES OVERDUE! 🚨`,
          body: `CRITICAL: Still no check-in for ${petName}! Emergency contacts are being notified. Tap to respond immediately!`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          sticky: true,
          vibrate: [0, 1000, 500, 1000],
          categoryIdentifier: 'pet-alert-alarm',
          data: {
            type: 'follow-up-alert',
            petName,
            minutesOverdue: i * 5,
            emergencyContacts: JSON.stringify(emergencyContacts),
            careInstructions: JSON.stringify(careInstructions),
          }
        },
        trigger: {
          seconds: alertTime,
        },
      });
      
      notificationIds.push(followUpId);
    }
    
    // Schedule reminder notification 5 minutes before expiry (for longer timers)
    if (durationMinutes >= 60) {
      const reminderId = await Notifications.scheduleNotificationAsync({
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
      
      notificationIds.push(reminderId);
    }
    
    // Store notification IDs for cleanup
    await AsyncStorage.setItem('activeNotificationIds', JSON.stringify(notificationIds));
    
    console.log(`Scheduled ${notificationIds.length} notifications for ${durationMinutes}-minute timer`);
    return notificationIds;
    
  } catch (error) {
    console.error('Error scheduling robust notifications:', error);
    return notificationIds;
  }
}

// Handle notification responses (when user taps notification)
export async function handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
  const { notification } = response;
  const data = notification.request.content.data;
  
  if (data.type === 'timer-expired' || data.type === 'follow-up-alert') {
    const actionIdentifier = response.actionIdentifier;
    
    if (actionIdentifier === 'check-in' || actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      // User wants to check in - clear all pending notifications
      await clearAllTimerNotifications();
      await AsyncStorage.removeItem('pendingTimer');
      
      // Show success message (this will be handled by the app if it's open)
      console.log('User checked in via notification');
      
    } else if (actionIdentifier === 'send-sms') {
      // Send SMS alerts immediately
      try {
        const emergencyContacts = JSON.parse(data.emergencyContacts || '[]');
        const careInstructions = JSON.parse(data.careInstructions || '{}');
        
        if (emergencyContacts.length > 0) {
          const message = `🚨 PET SAFETY ALERT 🚨\n\nThis is an automated emergency alert. ${data.petName}'s safety timer has expired and the owner has not checked in.\n\nPlease check on the pet immediately.\n\nContact info: Check directly with the pet owner.\n\nThis alert was sent automatically by the PetSafe app.`;
          
          const smsResult = await sendAutomaticSMS(emergencyContacts, message);
          
          // Store SMS result
          await AsyncStorage.setItem('lastSmsResult', JSON.stringify({
            success: smsResult.success,
            sentTo: smsResult.sentTo,
            failedTo: smsResult.failedTo,
            message: smsResult.message,
            timestamp: Date.now(),
          }));
          
          console.log('SMS alerts sent via notification action:', smsResult);
        }
      } catch (error) {
        console.error('Error sending SMS via notification:', error);
      }
    }
  }
}

// Clear all timer-related notifications
export async function clearAllTimerNotifications(): Promise<void> {
  try {
    const idsStr = await AsyncStorage.getItem('activeNotificationIds');
    if (idsStr) {
      const ids: string[] = JSON.parse(idsStr);
      
      // Cancel all scheduled notifications
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      
      // Clear displayed notifications
      await Notifications.dismissAllNotificationsAsync();
      
      await AsyncStorage.removeItem('activeNotificationIds');
      console.log(`Cleared ${ids.length} timer notifications`);
    }
  } catch (error) {
    console.error('Error clearing timer notifications:', error);
  }
}

// Check if there's a pending timer that may have expired
export async function checkPendingTimer(): Promise<{
  expired: boolean;
  timerData?: any;
  minutesOverdue?: number;
} | null> {
  try {
    const timerDataStr = await AsyncStorage.getItem('pendingTimer');
    if (!timerDataStr) {
      return null;
    }
    
    const timerData = JSON.parse(timerDataStr);
    const now = Date.now();
    const endTime = timerData.startTime + (timerData.duration * 60 * 1000);
    
    if (now >= endTime) {
      const minutesOverdue = Math.floor((now - endTime) / (1000 * 60));
      return {
        expired: true,
        timerData,
        minutesOverdue,
      };
    }
    
    return { expired: false, timerData };
  } catch (error) {
    console.error('Error checking pending timer:', error);
    return null;
  }
}