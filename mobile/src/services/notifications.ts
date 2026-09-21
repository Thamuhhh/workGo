import apiClient from './api';

export interface ServerNotification {
  id: string;
  icon: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export async function fetchNotifications(): Promise<ServerNotification[]> {
  const { data } = await apiClient.get('/notifications');
  return data.notifications ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await apiClient.patch(`/notifications/${id}/read`);
  } catch {
    // best effort
  }
}

export async function markNotificationsReadServer(): Promise<void> {
  try {
    await apiClient.patch('/notifications/read-all');
  } catch {
    // best effort
  }
}