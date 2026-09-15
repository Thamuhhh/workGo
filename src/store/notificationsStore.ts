import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppNotification {
  id: string;
  icon: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsState {
  notifications: AppNotification[];
  markAllRead: () => void;
  markRead: (id: string) => void;
  push: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  loadStoredNotifications: () => Promise<void>;
}

const NOTIF_STORAGE_KEY = '@workgo_notifications';

const mins = (n: number) => new Date(Date.now() - n * 60000).toISOString();

function seed(): AppNotification[] {
  return [
    { id: 'n1', icon: 'checkmark-circle', title: 'Application accepted', body: 'SparkPromo Events accepted your application for Event Booth Promoter.', timestamp: mins(35), read: false },
    { id: 'n2', icon: 'star', title: 'You got rated 5.0', body: 'City Grand Banquets rated your work. Great job!', timestamp: mins(90), read: false },
    { id: 'n3', icon: 'wallet-outline', title: 'Payout received', body: '₹900 for Wedding Catering Staff landed in your wallet.', timestamp: mins(140), read: false },
    { id: 'n4', icon: 'chatbubble-outline', title: 'New message', body: 'Sri Balaji Caterers: "We need you by 9 AM tomorrow. Confirm?"', timestamp: mins(180), read: true },
    { id: 'n5', icon: 'gift', title: 'Referral bonus ₹100', body: 'Your friend Rahul S. finished their first job. Bonus added!', timestamp: mins(300), read: true },
  ];
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: seed(),

  markAllRead: () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
    AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(get().notifications)).catch(() => {});
  },

  markRead: (id) => {
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(get().notifications)).catch(() => {});
  },

  push: (n) => {
    set((s) => ({
      notifications: [
        { ...n, id: `n${Date.now()}`, timestamp: new Date().toISOString(), read: false },
        ...s.notifications,
      ],
    }));
    AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(get().notifications)).catch(() => {});
  },

  loadStoredNotifications: async () => {
    try {
      const raw = await AsyncStorage.getItem(NOTIF_STORAGE_KEY);
      if (raw) {
        set({ notifications: JSON.parse(raw) as AppNotification[] });
      }
    } catch (e) {
      console.error('Failed to read notifications from storage:', e);
    }
  },
}));