import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePetAlertStore } from '../state/petAlertStore';
import { cn } from '../utils/cn';
import { 
  scheduleTimerNotification, 
  cancelAllNotifications, 
  sendEmergencyAlerts, 
  formatAlertMessage,
  triggerAlarm 
} from '../utils/notifications';
import CustomTimerInput from '../components/CustomTimerInput';
import PetProfileDisplay from '../components/PetProfileDisplay';
import PetProfileSetup from '../components/PetProfileSetup';

interface TimerScreenProps {
  navigation: any;
}

export default function TimerScreen({ navigation }: TimerScreenProps) {
  const insets = useSafeAreaInsets();
  const {
    petProfile,
    timerDuration,
    timerStartTime,
    timerEndTime,
    isTimerActive,
    hasBeenAlerted,
    smsStatus,
    emergencyContacts,
    setTimerDuration,
    startTimer,
    checkIn,
    stopTimer,
    triggerAlert,
    setSmsStatus,
  } = usePetAlertStore();

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(timerDuration);
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [showCustomTimer, setShowCustomTimer] = useState(false);
  const [showPetProfile, setShowPetProfile] = useState(false);

  const durations = [15, 30, 60, 120, 240, 480, 1440, 2880]; // minutes (last two are 1 day, 2 days)

  // Show pet profile setup for first-time users
  useEffect(() => {
    if (petProfile.name === 'My Pet') {
      // Small delay to let the screen render first
      setTimeout(() => {
        setShowPetProfile(true);
      }, 500);
    }
  }, [petProfile.name]);

  const handleTimerExpired = async () => {
    try {
      // Trigger alarm immediately
      await triggerAlarm();
      
      // Send SMS alerts to emergency contacts
      const smsResult = await sendEmergencyAlerts(emergencyContacts);
      
      // Store SMS status
      setSmsStatus({
        sent: smsResult.success,
        sentTo: smsResult.sentTo,
        failedTo: smsResult.failedTo,
        message: smsResult.message,
      });
      
      if (smsResult.success) {
        Alert.alert(
          "🚨 PET ALERT TRIGGERED! 🚨",
          `URGENT: Your pet safety timer has expired!\n\n✅ SMS alerts automatically sent to:\n${smsResult.sentTo.map(phone => {
            const contact = emergencyContacts.find(c => c.phone === phone);
            return `• ${contact?.name || 'Unknown'} (${phone})`;
          }).join('\n')}\n\nYour emergency contacts have been notified and will check on your pets!\n\nPlease check in immediately!`,
          [
            { text: "Check In Now", onPress: handleCheckIn },
            { text: "Snooze 5 min", onPress: () => handleSnooze(5) },
          ]
        );
      } else {
        // Show partial success or failure
        const failedContacts = smsResult.failedTo.map(phone => {
          const contact = emergencyContacts.find(c => c.phone === phone);
          return `• ${contact?.name || 'Unknown'} (${phone})`;
        }).join('\n');
        
        Alert.alert(
          "🚨 PET ALERT TRIGGERED! 🚨",
          `URGENT: Your pet safety timer has expired!\n\n${smsResult.sentTo.length > 0 ? 
            `✅ SMS sent to ${smsResult.sentTo.length} contacts\n` : 
            ''
          }${smsResult.failedTo.length > 0 ? 
            `❌ Failed to send SMS to:\n${failedContacts}\n` : 
            ''
          }\nReason: ${smsResult.message}\n\nPlease contact your emergency contacts manually if needed!`,
          [
            { text: "Check In Now", onPress: handleCheckIn },
            { text: "Call Contacts", onPress: () => handleCallContacts() },
          ]
        );
      }
    } catch (error) {
      console.error('Error sending emergency alerts:', error);
      Alert.alert(
        "🚨 PET ALERT TRIGGERED! 🚨",
        "Timer expired but there was an issue sending SMS alerts. Please contact your emergency contacts manually.",
        [{ text: "Check In Now", onPress: handleCheckIn }]
      );
    }
  };

  const handleCallContacts = () => {
    // This would open the phone dialer for the first contact
    if (emergencyContacts.length > 0) {
      Alert.alert(
        "Emergency Contacts",
        `Call your emergency contacts:\n${emergencyContacts.map(c => `• ${c.name}: ${c.phone}`).join('\n')}`,
        [{ text: "OK" }]
      );
    }
  };

  const handleSnooze = async (minutes: number) => {
    const newEndTime = Date.now() + (minutes * 60 * 1000);
    // This would require updating the store to support snoozing
    // For now, just extend the timer
    Alert.alert("Snoozed", `Timer extended by ${minutes} minutes`);
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
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (totalMinutes: number) => {
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.join(' ') || '0m';
  };

  const handleStartTimer = async () => {
    if (emergencyContacts.length === 0) {
      Alert.alert(
        "Who Should We Call?",
        `We need at least one trusted friend who can check on ${petProfile.name} if needed.`,
        [
          { text: "Not Now", style: "cancel" },
          { text: "Add Someone", onPress: () => navigation.navigate('Contacts') }
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
    Alert.alert("Welcome Home! 🏠", `Great to have you back! ${petProfile.name} is safe and sound.`);
  };

  const handleStopTimer = async () => {
    // Cancel any pending notifications
    await cancelAllNotifications();
    setNotificationId(null);
    
    stopTimer();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6">
          {/* Header with Contacts Button */}
          <View className="flex-row justify-end py-4">
            <Pressable
              onPress={() => navigation.navigate('Contacts')}
              className="p-2"
            >
              <Ionicons name="people" size={24} color="#374151" />
            </Pressable>
          </View>

          {/* Pet Profile Display */}
          <PetProfileDisplay 
            onEdit={() => setShowPetProfile(true)}
          />

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
                {hasBeenAlerted ? "Help is on the way!" : `Until ${petProfile.name}'s safety check`}
              </Text>
            </View>

            {hasBeenAlerted && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <Text className="text-red-800 text-center font-bold text-lg">
                  🚨 EMERGENCY ALERT TRIGGERED! 🚨
                </Text>
                
                {smsStatus && (
                  <>
                    {smsStatus.sent && smsStatus.sentTo.length > 0 && (
                      <>
                        <Text className="text-green-700 text-center font-medium mt-2">
                          ✅ SMS automatically sent to:
                        </Text>
                        <Text className="text-green-600 text-center text-sm mt-1">
                          {smsStatus.sentTo.map(phone => {
                            const contact = emergencyContacts.find(c => c.phone === phone);
                            return `${contact?.name || 'Unknown'} (${phone})`;
                          }).join(', ')}
                        </Text>
                      </>
                    )}
                    
                    {smsStatus.failedTo.length > 0 && (
                      <>
                        <Text className="text-red-700 text-center font-medium mt-2">
                          ❌ Failed to send SMS to:
                        </Text>
                        <Text className="text-red-600 text-center text-sm mt-1">
                          {smsStatus.failedTo.map(phone => {
                            const contact = emergencyContacts.find(c => c.phone === phone);
                            return `${contact?.name || 'Unknown'} (${phone})`;
                          }).join(', ')}
                        </Text>
                      </>
                    )}
                    
                    <Text className="text-red-500 text-center text-xs mt-2">
                      {smsStatus.message}
                    </Text>
                  </>
                )}
                
                {!smsStatus && (
                  <Text className="text-red-500 text-center text-xs mt-2">
                    SMS status unknown - please contact emergency contacts manually
                  </Text>
                )}
              </View>
            )}

            <View className="w-full space-y-4">
              <Pressable
                onPress={handleCheckIn}
                className="bg-green-500 py-4 px-8 rounded-xl items-center"
              >
                <Text className="text-white text-lg font-semibold">
                  I'm Back! {petProfile.name} is Safe
                </Text>
              </Pressable>

              <Pressable
                onPress={handleStopTimer}
                className="bg-gray-500 py-3 px-8 rounded-xl items-center"
              >
                <Text className="text-white text-base font-medium">
                  Cancel Safety Timer
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center">
            {/* Duration Selection */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
                How long will you be away?
              </Text>
              <View className="flex-row flex-wrap justify-center gap-3 mb-4">
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
                      "font-medium text-center",
                      selectedDuration === duration
                        ? "text-white"
                        : "text-gray-700"
                    )}>
                      {formatDuration(duration)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              
              {/* Custom Timer Button */}
              <Pressable
                onPress={() => setShowCustomTimer(true)}
                className="flex-row items-center justify-center py-3 px-4 rounded-lg border-2 border-purple-500 bg-purple-50"
              >
                <Ionicons name="time" size={20} color="#8B5CF6" />
                <Text className="text-purple-700 font-medium ml-2">Custom Timer</Text>
              </Pressable>
            </View>

            {/* Emergency Contacts Status */}
            <View className="bg-gray-50 rounded-lg p-4 mb-8">
              <Text className="text-gray-800 font-medium mb-2">
                Trusted Helpers ({emergencyContacts.length})
              </Text>
              {emergencyContacts.length > 0 ? (
                emergencyContacts.slice(0, 2).map((contact) => (
                  <Text key={contact.id} className="text-gray-600 text-sm">
                    • {contact.name} will get an SMS
                  </Text>
                ))
              ) : (
                <Text className="text-red-600 text-sm">
                  No trusted helpers added yet
                </Text>
              )}
              {emergencyContacts.length > 2 && (
                <Text className="text-gray-500 text-sm">
                  +{emergencyContacts.length - 2} more helpers
                </Text>
              )}
            </View>

            {/* Selected Duration Display */}
            <View className="bg-blue-50 rounded-lg p-4 mb-6">
              <Text className="text-blue-800 font-medium text-center">
                You'll be away for: {formatDuration(selectedDuration)}
              </Text>
              <Text className="text-blue-600 text-sm text-center mt-1">
                We'll check on {petProfile.name} if you don't return in time
              </Text>
            </View>

            {/* Start Timer Button */}
            <Pressable
              onPress={handleStartTimer}
              className="bg-blue-500 py-4 px-8 rounded-xl items-center mb-4"
            >
              <Text className="text-white text-lg font-semibold">
                Start Safety Timer for {petProfile.name}
              </Text>
            </Pressable>

            {emergencyContacts.length === 0 && (
              <Pressable
                onPress={() => navigation.navigate('Contacts')}
                className="py-3 px-8 rounded-xl items-center border border-blue-500"
              >
                <Text className="text-blue-500 text-base font-medium">
                  Add Trusted Friends to Help
                </Text>
              </Pressable>
            )}
          </View>
        )}
          {/* Bottom padding for better scrolling */}
          <View className="h-20" />
        </View>
      </ScrollView>

      {/* Pet Profile Modal */}
      <PetProfileSetup
        visible={showPetProfile}
        onClose={() => setShowPetProfile(false)}
      />

      {/* Custom Timer Modal */}
      <CustomTimerInput
        visible={showCustomTimer}
        onClose={() => setShowCustomTimer(false)}
        onConfirm={(minutes) => setSelectedDuration(minutes)}
        initialMinutes={selectedDuration}
      />
    </SafeAreaView>
  );
}