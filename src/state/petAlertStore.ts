import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface PetAlertState {
  // Timer state
  timerDuration: number; // in minutes
  timerStartTime: number | null;
  timerEndTime: number | null;
  isTimerActive: boolean;
  hasBeenAlerted: boolean;
  notificationId: string | null;
  
  // SMS status
  smsStatus: {
    sent: boolean;
    sentTo: string[];
    failedTo: string[];
    message: string;
  } | null;
  
  // Emergency contacts
  emergencyContacts: EmergencyContact[];
  
  // Actions
  setTimerDuration: (duration: number) => void;
  startTimer: () => void;
  checkIn: () => void;
  stopTimer: () => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeEmergencyContact: (id: string) => void;
  updateEmergencyContact: (id: string, updates: Partial<EmergencyContact>) => void;
  triggerAlert: () => void;
  setSmsStatus: (status: { sent: boolean; sentTo: string[]; failedTo: string[]; message: string }) => void;
}

export const usePetAlertStore = create<PetAlertState>()(
  persist(
    (set, get) => ({
      // Initial state
      timerDuration: 60, // default 1 hour
      timerStartTime: null,
      timerEndTime: null,
      isTimerActive: false,
      hasBeenAlerted: false,
      notificationId: null,
      smsStatus: null,
      emergencyContacts: [],
      
      // Actions
      setTimerDuration: (duration: number) => {
        set({ timerDuration: duration });
      },
      
      startTimer: () => {
        const now = Date.now();
        const endTime = now + (get().timerDuration * 60 * 1000);
        set({
          timerStartTime: now,
          timerEndTime: endTime,
          isTimerActive: true,
          hasBeenAlerted: false,
        });
      },
      
      checkIn: () => {
        set({
          timerStartTime: null,
          timerEndTime: null,
          isTimerActive: false,
          hasBeenAlerted: false,
          notificationId: null,
          smsStatus: null,
        });
      },
      
      stopTimer: () => {
        set({
          timerStartTime: null,
          timerEndTime: null,
          isTimerActive: false,
          hasBeenAlerted: false,
          notificationId: null,
          smsStatus: null,
        });
      },
      
      addEmergencyContact: (contact) => {
        const newContact: EmergencyContact = {
          ...contact,
          id: Date.now().toString(),
        };
        set((state) => ({
          emergencyContacts: [...state.emergencyContacts, newContact],
        }));
      },
      
      removeEmergencyContact: (id: string) => {
        set((state) => ({
          emergencyContacts: state.emergencyContacts.filter(contact => contact.id !== id),
        }));
      },
      
      updateEmergencyContact: (id: string, updates: Partial<EmergencyContact>) => {
        set((state) => ({
          emergencyContacts: state.emergencyContacts.map(contact =>
            contact.id === id ? { ...contact, ...updates } : contact
          ),
        }));
      },
      
      triggerAlert: () => {
        set({ hasBeenAlerted: true });
      },
      
      setSmsStatus: (status) => {
        set({ smsStatus: status });
      },
    }),
    {
      name: 'pet-alert-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        timerDuration: state.timerDuration,
        emergencyContacts: state.emergencyContacts,
      }),
    }
  )
);