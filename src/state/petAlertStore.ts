import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface PetProfile {
  name: string;
  photo?: string; // base64 or file URI
}

export interface CareInstructions {
  // Feeding
  foodType: string;
  foodAmount: string;
  feedingTimes: string[];
  feedingNotes: string;
  
  // Medication
  medications: {
    id: string;
    name: string;
    dosage: string;
    timing: string;
    instructions: string;
  }[];
  
  // Veterinary
  vetName: string;
  vetPhone: string;
  vetAddress: string;
  
  // General care
  generalInstructions: string;
  emergencyNotes: string;
}

export interface PetAlertState {
  // Pet profile
  petProfile: PetProfile;
  
  // Care instructions
  careInstructions: CareInstructions;
  
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
  setPetProfile: (profile: Partial<PetProfile>) => void;
  setCareInstructions: (instructions: Partial<CareInstructions>) => void;
  addMedication: (medication: Omit<CareInstructions['medications'][0], 'id'>) => void;
  removeMedication: (id: string) => void;
  updateMedication: (id: string, updates: Partial<CareInstructions['medications'][0]>) => void;
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
      petProfile: {
        name: 'My Pet',
        photo: undefined,
      },
      careInstructions: {
        foodType: '',
        foodAmount: '',
        feedingTimes: [],
        feedingNotes: '',
        medications: [],
        vetName: '',
        vetPhone: '',
        vetAddress: '',
        generalInstructions: '',
        emergencyNotes: '',
      },
      timerDuration: 60, // default 1 hour
      timerStartTime: null,
      timerEndTime: null,
      isTimerActive: false,
      hasBeenAlerted: false,
      notificationId: null,
      smsStatus: null,
      emergencyContacts: [],
      
      // Actions
      setPetProfile: (profile: Partial<PetProfile>) => {
        set((state) => ({
          petProfile: { ...state.petProfile, ...profile }
        }));
      },
      
      setCareInstructions: (instructions: Partial<CareInstructions>) => {
        set((state) => ({
          careInstructions: { ...state.careInstructions, ...instructions }
        }));
      },
      
      addMedication: (medication) => {
        const newMedication = {
          ...medication,
          id: Date.now().toString(),
        };
        set((state) => ({
          careInstructions: {
            ...state.careInstructions,
            medications: [...state.careInstructions.medications, newMedication],
          }
        }));
      },
      
      removeMedication: (id: string) => {
        set((state) => ({
          careInstructions: {
            ...state.careInstructions,
            medications: state.careInstructions.medications.filter(med => med.id !== id),
          }
        }));
      },
      
      updateMedication: (id: string, updates) => {
        set((state) => ({
          careInstructions: {
            ...state.careInstructions,
            medications: state.careInstructions.medications.map(med =>
              med.id === id ? { ...med, ...updates } : med
            ),
          }
        }));
      },
      
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
        petProfile: state.petProfile,
        careInstructions: state.careInstructions,
        timerDuration: state.timerDuration,
        emergencyContacts: state.emergencyContacts,
      }),
    }
  )
);