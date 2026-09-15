import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: UserProfile, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<UserProfile>) => void;
  loadStoredAuth: () => Promise<void>;
}

const AUTH_STORAGE_KEY = '@workgo_auth_session';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (user: UserProfile, token: string) => {
    try {
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user, token })
      );
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (e) {
      console.error('Failed to persist auth session:', e);
      set({ user, token, isAuthenticated: true, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove auth session:', e);
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (updatedFields: Partial<UserProfile>) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const newUser = { ...currentUser, ...updatedFields };
    set({ user: newUser });
    const token = get().token;
    if (token) {
      AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: newUser, token })
      ).catch((err) => console.error('Error syncing updated user:', err));
    }
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const { user, token } = JSON.parse(stored);
        if (token && user) {
          set({ user, token, isAuthenticated: true, isLoading: false });
          return;
        }
      }
    } catch (e) {
      console.error('Failed to read auth from storage:', e);
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
}));
