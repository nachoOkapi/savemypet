import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../utils/cn';

interface CustomTimerInputProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (totalMinutes: number) => void;
  initialMinutes?: number;
}

export default function CustomTimerInput({ 
  visible, 
  onClose, 
  onConfirm, 
  initialMinutes = 60 
}: CustomTimerInputProps) {
  const [days, setDays] = useState(Math.floor(initialMinutes / (24 * 60)));
  const [hours, setHours] = useState(Math.floor((initialMinutes % (24 * 60)) / 60));
  const [minutes, setMinutes] = useState(initialMinutes % 60);

  const handleConfirm = () => {
    const totalMinutes = (days * 24 * 60) + (hours * 60) + minutes;
    if (totalMinutes > 0) {
      onConfirm(totalMinutes);
      onClose();
    }
  };

  const formatTimeDisplay = () => {
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.join(' ') || '0m';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-gray-900">How long will you be away?</Text>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          <View className="space-y-6">
            {/* Days Input */}
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-medium text-gray-700">Days</Text>
              <View className="flex-row items-center space-x-4">
                <Pressable
                  onPress={() => setDays(Math.max(0, days - 1))}
                  className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Ionicons name="remove" size={20} color="#374151" />
                </Pressable>
                <TextInput
                  value={days.toString()}
                  onChangeText={(text) => setDays(Math.max(0, parseInt(text) || 0))}
                  keyboardType="numeric"
                  className="w-16 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg"
                  maxLength={2}
                />
                <Pressable
                  onPress={() => setDays(Math.min(30, days + 1))}
                  className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Ionicons name="add" size={20} color="#374151" />
                </Pressable>
              </View>
            </View>

            {/* Hours Input */}
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-medium text-gray-700">Hours</Text>
              <View className="flex-row items-center space-x-4">
                <Pressable
                  onPress={() => setHours(Math.max(0, hours - 1))}
                  className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Ionicons name="remove" size={20} color="#374151" />
                </Pressable>
                <TextInput
                  value={hours.toString()}
                  onChangeText={(text) => setHours(Math.max(0, Math.min(23, parseInt(text) || 0)))}
                  keyboardType="numeric"
                  className="w-16 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg"
                  maxLength={2}
                />
                <Pressable
                  onPress={() => setHours(Math.min(23, hours + 1))}
                  className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Ionicons name="add" size={20} color="#374151" />
                </Pressable>
              </View>
            </View>

            {/* Minutes Input */}
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-medium text-gray-700">Minutes</Text>
              <View className="flex-row items-center space-x-4">
                <Pressable
                  onPress={() => setMinutes(Math.max(0, minutes - 1))}
                  className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Ionicons name="remove" size={20} color="#374151" />
                </Pressable>
                <TextInput
                  value={minutes.toString()}
                  onChangeText={(text) => setMinutes(Math.max(0, Math.min(59, parseInt(text) || 0)))}
                  keyboardType="numeric"
                  className="w-16 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg"
                  maxLength={2}
                />
                <Pressable
                  onPress={() => setMinutes(Math.min(59, minutes + 1))}
                  className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center"
                >
                  <Ionicons name="add" size={20} color="#374151" />
                </Pressable>
              </View>
            </View>

            {/* Preview */}
            <View className="bg-blue-50 rounded-lg p-4">
              <Text className="text-blue-800 font-medium text-center">
                You'll be away for: {formatTimeDisplay()}
              </Text>
              <Text className="text-blue-600 text-sm text-center mt-1">
                We'll keep your pet safe while you're gone
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-4">
              <Pressable
                onPress={onClose}
                className="flex-1 bg-gray-500 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-semibold text-lg">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                className={cn(
                  "flex-1 py-4 rounded-xl items-center",
                  ((days * 24 * 60) + (hours * 60) + minutes) > 0
                    ? "bg-blue-500"
                    : "bg-gray-300"
                )}
                disabled={((days * 24 * 60) + (hours * 60) + minutes) === 0}
              >
                <Text className={cn(
                  "font-semibold text-lg",
                  ((days * 24 * 60) + (hours * 60) + minutes) > 0
                    ? "text-white"
                    : "text-gray-500"
                )}>
                  Start Safety Watch
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}