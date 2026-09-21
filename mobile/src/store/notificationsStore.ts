import { create } from 'zustand';
import {
  fetchNotifications,
  markNotificationRead,
  markNotificationsReadServer,
} from '../services/notifications';

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
  loading: boolean;
  loadNotifications: () => Promise<void>;
  markAllRead: () => void;
  markRead: (id: string) => void;
  push: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  loadStoredNotifications: () => Promise<void>;
}

const TYPE_ICONS: Record<string, string> = {
  accepted: 'checkmark-circle',
  rejected: 'close-circle',
  payout: 'wallet-outline',
  rating: 'star',
  message: 'chatbubble-outline',
  offer: 'chatbox-ellipses-outline',
  referral: 'gift',
};

const toAppNotification = (n: any): AppNotification => ({
  id: n.id,
  icon: TYPE_ICONS[n.type] || n.icon || 'notifications-outline',
  title: n.title,
  body: n.body,
  timestamp: n.createdAt,
  read: n.read,
});

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  loading: false,

  loadNotifications: async () => {
    set({ loading: true });
    try {
      const list = await fetchNotifications();
      set({ notifications: list.map(toAppNotification) });
    } catch {
      // server unavailable; keep cached notifications
    } finally {
      set({ loading: false });
    }
  },

  markAllRead: () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
    markNotificationsReadServer();
  },

  markRead: (id) => {
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    markNotificationRead(id);
  },

  push: (n) => {
    set((s) => ({
      notifications: [
        { ...n, id: `n${Date.now()}`, timestamp: new Date().toISOString(), read: false },
        ...s.notifications,
      ],
    }));
  },

  loadStoredNotifications: async () => {
    await get().loadNotifications();
  },
}));