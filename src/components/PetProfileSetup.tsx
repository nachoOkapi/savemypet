import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Modal, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../utils/cn';
import { usePetAlertStore } from '../state/petAlertStore';

interface PetProfileSetupProps {
  visible: boolean;
  onClose: () => void;
}

export default function PetProfileSetup({ visible, onClose }: PetProfileSetupProps) {
  const { petProfile, setPetProfile } = usePetAlertStore();
  const [tempName, setTempName] = useState(petProfile.name);
  const [tempPhoto, setTempPhoto] = useState(petProfile.photo);

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setTempPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setTempPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSave = () => {
    if (!tempName.trim()) {
      Alert.alert('Pet Name Required', 'Please enter your pet\'s name.');
      return;
    }

    setPetProfile({
      name: tempName.trim(),
      photo: tempPhoto,
    });

    onClose();
  };

  const handleCancel = () => {
    // Reset to original values
    setTempName(petProfile.name);
    setTempPhoto(petProfile.photo);
    onClose();
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Pet Photo',
      'How would you like to add your pet\'s photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-3xl p-6 mx-6 w-full max-w-sm">
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">Pet Profile</Text>
            <Text className="text-gray-600 text-center">
              Let's set up your pet's profile for personalized safety alerts
            </Text>
          </View>

          {/* Pet Photo Section */}
          <View className="items-center mb-6">
            <Pressable
              onPress={showImageOptions}
              className="relative mb-4"
            >
              {tempPhoto ? (
                <View>
                  <Image
                    source={{ uri: tempPhoto }}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                    resizeMode="cover"
                  />
                  <View className="absolute -bottom-2 -right-2 bg-blue-500 w-10 h-10 rounded-full items-center justify-center shadow-md">
                    <Ionicons name="camera" size={20} color="white" />
                  </View>
                </View>
              ) : (
                <View className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center border-2 border-dashed border-gray-300">
                  <Ionicons name="camera" size={40} color="#9CA3AF" />
                  <Text className="text-gray-500 text-xs mt-2">Add Photo</Text>
                </View>
              )}
            </Pressable>
            
            <Text className="text-gray-600 text-sm text-center">
              Tap to {tempPhoto ? 'change' : 'add'} your pet's photo
            </Text>
          </View>

          {/* Pet Name Section */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Pet's Name</Text>
            <TextInput
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter your pet's name"
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white text-lg"
              autoCapitalize="words"
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <Pressable
              onPress={handleCancel}
              className="flex-1 bg-gray-500 py-3 px-4 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-lg">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl items-center",
                tempName.trim() ? "bg-blue-500" : "bg-gray-300"
              )}
              disabled={!tempName.trim()}
            >
              <Text className={cn(
                "font-semibold text-lg",
                tempName.trim() ? "text-white" : "text-gray-500"
              )}>
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}