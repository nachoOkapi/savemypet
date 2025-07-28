import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePetAlertStore, EmergencyContact } from '../state/petAlertStore';
import { cn } from '../utils/cn';

interface ContactsScreenProps {
  navigation: any;
}

export default function ContactsScreen({ navigation }: ContactsScreenProps) {
  const insets = useSafeAreaInsets();
  const { emergencyContacts, addEmergencyContact, removeEmergencyContact, updateEmergencyContact } = usePetAlertStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '' });
    setShowAddForm(false);
    setEditingContact(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Error', 'Name and phone number are required.');
      return;
    }

    if (editingContact) {
      updateEmergencyContact(editingContact.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
      });
    } else {
      addEmergencyContact({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
      });
    }

    resetForm();
  };

  const handleEdit = (contact: EmergencyContact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
    });
    setEditingContact(contact);
    setShowAddForm(true);
  };

  const handleDelete = (contact: EmergencyContact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to remove ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => removeEmergencyContact(contact.id)
        }
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
        <Text className="text-xl font-bold text-gray-900">Trusted Helpers</Text>
        <Pressable 
          onPress={() => setShowAddForm(true)}
          className="p-1"
        >
          <Ionicons name="add" size={24} color="#3B82F6" />
        </Pressable>
      </View>

      <ScrollView className="flex-1">
        {/* Info Section */}
        <View className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <Text className="text-blue-800 font-medium mb-1">
            How Pet Safety Works
          </Text>
          <Text className="text-blue-700 text-sm">
            If you don't return when expected, these trusted friends will receive a caring SMS asking 
            them to check on your pets. Your phone will also sound an alarm to wake you if needed.
            Add people you trust with a spare key or who live nearby.
          </Text>
        </View>

        {/* Add/Edit Form */}
        {showAddForm && (
          <View className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              {editingContact ? 'Edit Helper' : 'Add Trusted Helper'}
            </Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 font-medium mb-2">Name *</Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter contact name"
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Phone Number *</Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Email (Optional)</Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                />
              </View>

              <View className="flex-row space-x-3">
                <Pressable
                  onPress={handleSubmit}
                  className="flex-1 bg-blue-500 py-3 px-4 rounded-lg items-center"
                >
                  <Text className="text-white font-semibold">
                    {editingContact ? 'Update Helper' : 'Add Helper'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={resetForm}
                  className="flex-1 bg-gray-500 py-3 px-4 rounded-lg items-center"
                >
                  <Text className="text-white font-semibold">Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Contacts List */}
        <View className="px-6 py-4">
          {emergencyContacts.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="people-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-500 text-lg font-medium mt-4">
                No Trusted Helpers Yet
              </Text>
              <Text className="text-gray-400 text-center mt-2 mb-6">
                Add friends or family who can help check on your pets if needed.
              </Text>
              <Pressable
                onPress={() => setShowAddForm(true)}
                className="bg-blue-500 py-3 px-6 rounded-lg"
              >
                <Text className="text-white font-semibold">Add First Helper</Text>
              </Pressable>
            </View>
          ) : (
            <View className="space-y-3">
              <Text className="text-gray-700 font-medium mb-2">
                {emergencyContacts.length} Contact{emergencyContacts.length !== 1 ? 's' : ''}
              </Text>
              
              {emergencyContacts.map((contact) => (
                <View
                  key={contact.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold text-lg">
                        {contact.name}
                      </Text>
                      <Text className="text-gray-600 mt-1">
                        {contact.phone}
                      </Text>
                      {contact.email && (
                        <Text className="text-gray-500 text-sm mt-1">
                          {contact.email}
                        </Text>
                      )}
                    </View>
                    
                    <View className="flex-row space-x-2">
                      <Pressable
                        onPress={() => handleEdit(contact)}
                        className="p-2"
                      >
                        <Ionicons name="pencil" size={20} color="#6B7280" />
                      </Pressable>
                      
                      <Pressable
                        onPress={() => handleDelete(contact)}
                        className="p-2"
                      >
                        <Ionicons name="trash" size={20} color="#EF4444" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}