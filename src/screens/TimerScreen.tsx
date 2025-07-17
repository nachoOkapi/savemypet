import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePetAlertStore } from '../state/petAlertStore';
import { cn } from '../utils/cn';
import { 
  scheduleTimerNotification, 
  cancelAllNotifications, 
  sendEmergencyAlerts, 
  formatAlertMessage 
} from '../utils/notifications';

interface TimerScreenProps {
  navigation: any;
}

export default function TimerScreen({ navigation }: TimerScreenProps) {
  const insets = useSafeAreaInsets();
  const {
    timerDuration,
    timerStartTime,
    timerEndTime,
    isTimerActive,
    hasBeenAlerted,
    emergencyContacts,
    setTimerDuration,
    startTimer,
    checkIn,
    stopTimer,
    triggerAlert,
  } = usePetAlertStore();

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(timerDuration);
  const [notificationId, setNotificationId] = useState<string | null>(null);

  const durations = [15, 30, 60, 120, 240, 480]; // minutes

  const handleTimerExpired = async () => {
    try {
      // Send alerts to emergency contacts
      await sendEmergencyAlerts(emergencyContacts);
      
      Alert.alert(
        "Pet Alert Triggered!",
        `Emergency contacts have been notified: ${emergencyContacts.map(c => c.name).join(', ')}`,
        [
          { text: "Check In Now", onPress: handleCheckIn },
          { text: "Dismiss", style: "cancel" }
        ]
      );
    } catch (error) {
      console.error('Error sending emergency alerts:', error);
      Alert.alert(
        "Pet Alert Triggered!",
        "Timer expired but there was an issue sending alerts. Please contact your emergency contacts manually.",
        [{ text: "Check In Now", onPress: handleCheckIn }]
      );
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timerEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, timerEndTime - now);
        setTimeRemaining(remaining);
        
        // Check if timer has expired
        if (remaining === 0 && !hasBeenAlerted) {
          triggerAlert();
          handleTimerExpired();
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timerEndTime, hasBeenAlerted, triggerAlert, emergencyContacts, checkIn]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = async () => {
    if (emergencyContacts.length === 0) {
      Alert.alert(
        "No Emergency Contacts",
        "Please add at least one emergency contact before setting a timer.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Contact", onPress: () => navigation.navigate('Contacts') }
        ]
      );
      return;
    }
    
    // Schedule notification
    const notifId = await scheduleTimerNotification(selectedDuration);
    setNotificationId(notifId);
    
    setTimerDuration(selectedDuration);
    startTimer();
  };

  const handleCheckIn = async () => {
    // Cancel any pending notifications
    await cancelAllNotifications();
    setNotificationId(null);
    
    checkIn();
    Alert.alert("Checked In!", "Timer has been reset. Your pets are safe!");
  };

  const handleStopTimer = async () => {
    // Cancel any pending notifications
    await cancelAllNotifications();
    setNotificationId(null);
    
    stopTimer();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <Text className="text-2xl font-bold text-gray-900">Pet Alert</Text>
          <Pressable
            onPress={() => navigation.navigate('Contacts')}
            className="p-2"
          >
            <Ionicons name="people" size={24} color="#374151" />
          </Pressable>
        </View>

        {/* Status Display */}
        {isTimerActive ? (
          <View className="flex-1 items-center justify-center">
            <View className="items-center mb-8">
              <Ionicons 
                name={hasBeenAlerted ? "alert-circle" : "time"} 
                size={80} 
                color={hasBeenAlerted ? "#EF4444" : "#10B981"} 
              />
              <Text className={cn(
                "text-4xl font-bold mt-4",
                hasBeenAlerted ? "text-red-500" : "text-green-600"
              )}>
                {formatTime(timeRemaining)}
              </Text>
              <Text className="text-gray-600 text-lg mt-2">
                {hasBeenAlerted ? "Alert Triggered!" : "Time Remaining"}
              </Text>
            </View>

            {hasBeenAlerted && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <Text className="text-red-800 text-center font-medium">
                  Emergency contacts have been notified!
                </Text>
                <Text className="text-red-600 text-center text-sm mt-1">
                  {emergencyContacts.map(c => c.name).join(', ')}
                </Text>
              </View>
            )}

            <View className="w-full space-y-4">
              <Pressable
                onPress={handleCheckIn}
                className="bg-green-500 py-4 px-8 rounded-xl items-center"
              >
                <Text className="text-white text-lg font-semibold">
                  Check In - I'm Safe!
                </Text>
              </Pressable>

              <Pressable
                onPress={handleStopTimer}
                className="bg-gray-500 py-3 px-8 rounded-xl items-center"
              >
                <Text className="text-white text-base font-medium">
                  Cancel Timer
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center">
            {/* Duration Selection */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Set Timer Duration
              </Text>
              <View className="flex-row flex-wrap justify-center gap-3">
                {durations.map((duration) => (
                  <Pressable
                    key={duration}
                    onPress={() => setSelectedDuration(duration)}
                    className={cn(
                      "py-3 px-4 rounded-lg border-2",
                      selectedDuration === duration
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    )}
                  >
                    <Text className={cn(
                      "font-medium",
                      selectedDuration === duration
                        ? "text-white"
                        : "text-gray-700"
                    )}>
                      {duration < 60 ? `${duration}m` : `${duration / 60}h`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Emergency Contacts Status */}
            <View className="bg-gray-50 rounded-lg p-4 mb-8">
              <Text className="text-gray-800 font-medium mb-2">
                Emergency Contacts ({emergencyContacts.length})
              </Text>
              {emergencyContacts.length > 0 ? (
                emergencyContacts.slice(0, 2).map((contact) => (
                  <Text key={contact.id} className="text-gray-600 text-sm">
                    • {contact.name}
                  </Text>
                ))
              ) : (
                <Text className="text-red-600 text-sm">
                  No emergency contacts added
                </Text>
              )}
              {emergencyContacts.length > 2 && (
                <Text className="text-gray-500 text-sm">
                  +{emergencyContacts.length - 2} more
                </Text>
              )}
            </View>

            {/* Start Timer Button */}
            <Pressable
              onPress={handleStartTimer}
              className="bg-blue-500 py-4 px-8 rounded-xl items-center mb-4"
            >
              <Text className="text-white text-lg font-semibold">
                Start Pet Alert Timer
              </Text>
            </Pressable>

            {emergencyContacts.length === 0 && (
              <Pressable
                onPress={() => navigation.navigate('Contacts')}
                className="py-3 px-8 rounded-xl items-center border border-blue-500"
              >
                <Text className="text-blue-500 text-base font-medium">
                  Add Emergency Contacts
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}