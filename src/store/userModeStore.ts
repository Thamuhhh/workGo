import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserMode } from '../types';

interface UserModeState {
  mode: UserMode;
  setMode: (mode: UserMode) => Promise<void>;
  toggleMode: () => Promise<void>;
  loadStoredMode: () => Promise<void>;
}

const USER_MODE_STORAGE_KEY = '@workgo_active_mode';

export const useUserModeStore = create<UserModeState>((set, get) => ({
  mode: 'worker',

  setMode: async (mode: UserMode) => {
    set({ mode });
    try {
      await AsyncStorage.setItem(USER_MODE_STORAGE_KEY, mode);
    } catch (e) {
      console.error('Failed to persist user mode:', e);
    }
  },

  toggleMode: async () => {
    const current = get().mode;
    const nextMode: UserMode = current === 'worker' ? 'employer' : 'worker';
    await get().setMode(nextMode);
  },

  loadStoredMode: async () => {
    try {
      const stored = await AsyncStorage.getItem(USER_MODE_STORAGE_KEY);
      if (stored === 'worker' || stored === 'employer') {
        set({ mode: stored });
      }
    } catch (e) {
      console.error('Failed to read user mode from storage:', e);
    }
  },
}));
