import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePetAlertStore } from '../state/petAlertStore';
import { cn } from '../utils/cn';

interface PetProfileDisplayProps {
  onEdit: () => void;
  compact?: boolean;
  showAppIcon?: boolean;
}

export default function PetProfileDisplay({ onEdit, compact = false, showAppIcon = true }: PetProfileDisplayProps) {
  const { petProfile } = usePetAlertStore();

  if (compact) {
    return (
      <Pressable
        onPress={onEdit}
        className="flex-row items-center bg-white rounded-lg p-3 border border-gray-200"
      >
        {petProfile.photo ? (
          <Image
            source={{ uri: petProfile.photo }}
            className="w-10 h-10 rounded-full mr-3"
            resizeMode="cover"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
            <Ionicons name="paw" size={20} color="#9CA3AF" />
          </View>
        )}
        <Text className="text-gray-700 font-medium flex-1">{petProfile.name}</Text>
        <Ionicons name="pencil" size={16} color="#6B7280" />
      </Pressable>
    );
  }

  return (
    <View className="items-center mb-6">
      {/* App Icon */}
      {showAppIcon && (
        <View className="mb-8">
          <Image
            source={{ uri: 'https://images.composerapi.com/6B13487E-0E47-46D5-9725-02DB5883E345.jpg' }}
            className="w-20 h-20 rounded-2xl shadow-lg"
            resizeMode="contain"
          />
        </View>
      )}

      {/* Pet Profile Section */}
      <Pressable
        onPress={onEdit}
        className="items-center bg-blue-50 rounded-3xl p-8 border border-blue-100 w-full"
      >
        {/* Pet Photo - Much Larger */}
        <View className="relative mb-6">
          {petProfile.photo ? (
            <Image
              source={{ uri: petProfile.photo }}
              className="w-40 h-40 rounded-full border-6 border-white shadow-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-40 h-40 rounded-full bg-white border-6 border-gray-200 items-center justify-center shadow-xl">
              <Ionicons name="paw" size={60} color="#9CA3AF" />
            </View>
          )}
          
          <View className="absolute -bottom-2 -right-2 bg-blue-500 w-12 h-12 rounded-full items-center justify-center shadow-lg">
            <Ionicons name="pencil" size={20} color="white" />
          </View>
        </View>

        {/* Pet Name */}
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          {petProfile.name}
        </Text>
        
        <Text className="text-gray-600 text-base">
          Tap to edit profile
        </Text>
      </Pressable>
    </View>
  );
}