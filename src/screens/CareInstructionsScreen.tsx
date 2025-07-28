import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePetAlertStore } from '../state/petAlertStore';
import { cn } from '../utils/cn';

interface CareInstructionsScreenProps {
  navigation: any;
}

export default function CareInstructionsScreen({ navigation }: CareInstructionsScreenProps) {
  const insets = useSafeAreaInsets();
  const { 
    petProfile,
    careInstructions, 
    setCareInstructions, 
    addMedication, 
    removeMedication, 
    updateMedication 
  } = usePetAlertStore();

  const [showAddMedication, setShowAddMedication] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    timing: '',
    instructions: '',
  });

  const [formData, setFormData] = useState({
    foodType: careInstructions.foodType,
    foodAmount: careInstructions.foodAmount,
    feedingTimes: careInstructions.feedingTimes.join(', '),
    feedingNotes: careInstructions.feedingNotes,
    vetName: careInstructions.vetName,
    vetPhone: careInstructions.vetPhone,
    vetAddress: careInstructions.vetAddress,
    generalInstructions: careInstructions.generalInstructions,
    emergencyNotes: careInstructions.emergencyNotes,
  });

  const handleSave = () => {
    setCareInstructions({
      ...careInstructions,
      foodType: formData.foodType,
      foodAmount: formData.foodAmount,
      feedingTimes: formData.feedingTimes.split(',').map(time => time.trim()).filter(time => time),
      feedingNotes: formData.feedingNotes,
      vetName: formData.vetName,
      vetPhone: formData.vetPhone,
      vetAddress: formData.vetAddress,
      generalInstructions: formData.generalInstructions,
      emergencyNotes: formData.emergencyNotes,
    });

    Alert.alert(
      'Instructions Saved! ✅',
      'Your pet care instructions have been updated and will be included in emergency alerts.',
      [{ text: 'OK' }]
    );
  };

  const handleAddMedication = () => {
    if (!newMedication.name.trim()) {
      Alert.alert('Error', 'Please enter the medication name.');
      return;
    }

    addMedication({
      name: newMedication.name.trim(),
      dosage: newMedication.dosage.trim(),
      timing: newMedication.timing.trim(),
      instructions: newMedication.instructions.trim(),
    });

    setNewMedication({ name: '', dosage: '', timing: '', instructions: '' });
    setShowAddMedication(false);
  };

  const handleDeleteMedication = (id: string, name: string) => {
    Alert.alert(
      'Remove Medication',
      `Remove ${name} from the medication list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeMedication(id) }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
        <Pressable onPress={() => navigation.goBack()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900">Care Instructions</Text>
        <Pressable onPress={handleSave} className="p-1">
          <Text className="text-blue-500 font-semibold">Save</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          {/* Instructions Header */}
          <View className="bg-blue-50 rounded-lg p-4 mb-6">
            <Text className="text-blue-800 font-bold text-lg mb-2">
              Instructions for {petProfile.name}'s Care
            </Text>
            <Text className="text-blue-700 text-sm">
              These detailed instructions will be sent to your trusted helpers if you don't return on time. 
              Include everything they need to know to keep {petProfile.name} happy and healthy.
            </Text>
          </View>

          {/* Feeding Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4 flex-row items-center">
              <Ionicons name="restaurant" size={20} color="#374151" /> 
              <Text className="ml-2">Feeding Instructions</Text>
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 font-medium mb-2">Food Type & Brand</Text>
                <TextInput
                  value={formData.foodType}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, foodType: text }))}
                  placeholder="e.g., Blue Buffalo Adult Chicken & Rice"
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                  multiline
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Amount per Feeding</Text>
                <TextInput
                  value={formData.foodAmount}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, foodAmount: text }))}
                  placeholder="e.g., 1 cup, 1/2 can, 2 scoops"
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Feeding Times</Text>
                <TextInput
                  value={formData.feedingTimes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, feedingTimes: text }))}
                  placeholder="e.g., 7:00 AM, 12:00 PM, 6:00 PM"
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Special Feeding Notes</Text>
                <TextInput
                  value={formData.feedingNotes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, feedingNotes: text }))}
                  placeholder="e.g., Add water to dry food, no table scraps, food allergies..."
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white h-20"
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Medication Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900 flex-row items-center">
                <Ionicons name="medical" size={20} color="#374151" />
                <Text className="ml-2">Medications</Text>
              </Text>
              <Pressable
                onPress={() => setShowAddMedication(true)}
                className="bg-blue-500 px-3 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Add</Text>
              </Pressable>
            </View>

            {careInstructions.medications.length === 0 ? (
              <View className="bg-gray-50 rounded-lg p-4 items-center">
                <Ionicons name="medical-outline" size={32} color="#9CA3AF" />
                <Text className="text-gray-500 text-center mt-2">
                  No medications added yet
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Add any medications {petProfile.name} needs
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {careInstructions.medications.map((med) => (
                  <View key={med.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-900 font-bold text-lg">{med.name}</Text>
                      <Pressable
                        onPress={() => handleDeleteMedication(med.id, med.name)}
                        className="p-1"
                      >
                        <Ionicons name="trash" size={18} color="#EF4444" />
                      </Pressable>
                    </View>
                    {med.dosage && (
                      <Text className="text-gray-600 mb-1">
                        <Text className="font-medium">Dosage:</Text> {med.dosage}
                      </Text>
                    )}
                    {med.timing && (
                      <Text className="text-gray-600 mb-1">
                        <Text className="font-medium">When:</Text> {med.timing}
                      </Text>
                    )}
                    {med.instructions && (
                      <Text className="text-gray-600">
                        <Text className="font-medium">Instructions:</Text> {med.instructions}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Add Medication Form */}
            {showAddMedication && (
              <View className="mt-4 bg-gray-50 rounded-lg p-4">
                <Text className="text-gray-900 font-bold mb-3">Add New Medication</Text>
                <View className="space-y-3">
                  <TextInput
                    value={newMedication.name}
                    onChangeText={(text) => setNewMedication(prev => ({ ...prev, name: text }))}
                    placeholder="Medication name"
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  />
                  <TextInput
                    value={newMedication.dosage}
                    onChangeText={(text) => setNewMedication(prev => ({ ...prev, dosage: text }))}
                    placeholder="Dosage (e.g., 1 tablet, 5mg)"
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  />
                  <TextInput
                    value={newMedication.timing}
                    onChangeText={(text) => setNewMedication(prev => ({ ...prev, timing: text }))}
                    placeholder="When to give (e.g., twice daily, with food)"
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  />
                  <TextInput
                    value={newMedication.instructions}
                    onChangeText={(text) => setNewMedication(prev => ({ ...prev, instructions: text }))}
                    placeholder="Special instructions"
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  />
                </View>
                <View className="flex-row space-x-3 mt-3">
                  <Pressable
                    onPress={handleAddMedication}
                    className="flex-1 bg-blue-500 py-2 px-4 rounded-lg items-center"
                  >
                    <Text className="text-white font-medium">Add Medication</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowAddMedication(false)}
                    className="flex-1 bg-gray-500 py-2 px-4 rounded-lg items-center"
                  >
                    <Text className="text-white font-medium">Cancel</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Veterinarian Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4 flex-row items-center">
              <Ionicons name="medical-outline" size={20} color="#374151" />
              <Text className="ml-2">Veterinarian Information</Text>
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 font-medium mb-2">Vet Name/Clinic</Text>
                <TextInput
                  value={formData.vetName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, vetName: text }))}
                  placeholder="e.g., Dr. Smith, Happy Paws Veterinary Clinic"
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Vet Phone Number</Text>
                <TextInput
                  value={formData.vetPhone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, vetPhone: text }))}
                  placeholder="e.g., (555) 123-4567"
                  keyboardType="phone-pad"
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Vet Address</Text>
                <TextInput
                  value={formData.vetAddress}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, vetAddress: text }))}
                  placeholder="Full address for emergencies"
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white h-16"
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* General Instructions Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4 flex-row items-center">
              <Ionicons name="clipboard" size={20} color="#374151" />
              <Text className="ml-2">General Care Instructions</Text>
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 font-medium mb-2">Daily Care Instructions</Text>
                <TextInput
                  value={formData.generalInstructions}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, generalInstructions: text }))}
                  placeholder="e.g., Walk schedule, favorite toys, where they sleep, behavioral notes..."
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white h-24"
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Emergency Notes</Text>
                <TextInput
                  value={formData.emergencyNotes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, emergencyNotes: text }))}
                  placeholder="e.g., Emergency vet contact, allergies, medical conditions, where to find supplies..."
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white h-24"
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            className="bg-blue-500 py-4 px-8 rounded-xl items-center mb-8"
          >
            <Text className="text-white text-lg font-semibold">
              Save Care Instructions
            </Text>
          </Pressable>

          {/* Bottom padding */}
          <View className="h-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}