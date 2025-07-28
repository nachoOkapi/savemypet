import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePetAlertStore } from '../state/petAlertStore';
import { cn } from '../utils/cn';

interface PetProfileDisplayProps {
  onEdit: () => void;
  compact?: boolean;
}

export default function PetProfileDisplay({ onEdit, compact = false }: PetProfileDisplayProps) {
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
    <Pressable
      onPress={onEdit}
      className="items-center bg-blue-50 rounded-3xl p-6 mb-4 border border-blue-100 w-full"
    >
        {/* Pet Photo - Much Larger */}
        <View className="relative mb-4">
          {petProfile.photo ? (
            <Image
              source={{ uri: petProfile.photo }}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              resizeMode="cover"
            />
          ) : (
            <View className="w-32 h-32 rounded-full bg-white border-4 border-gray-200 items-center justify-center shadow-lg">
              <Ionicons name="paw" size={48} color="#9CA3AF" />
            </View>
          )}
          
          <View className="absolute -bottom-1 -right-1 bg-blue-500 w-10 h-10 rounded-full items-center justify-center shadow-md">
            <Ionicons name="pencil" size={18} color="white" />
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
  );
}