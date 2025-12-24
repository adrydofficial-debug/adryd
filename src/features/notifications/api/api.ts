import apiClient from '../../../services/apiClient';

export type NotificationResponse = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, any> | null;
  read: boolean;
  created_at: string;
  updated_at: string;
};

export interface NotificationEntity {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any> | null;
}

function mapNotification(n: NotificationResponse): NotificationEntity {
  return {
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type,
    read: n.read,
    createdAt: n.created_at,
    data: n.data || null,
  };
}

export const notificationsApi = {
  async getAll(): Promise<NotificationEntity[]> {
    console.log('[Notifications] GET /api/notifications');
    const res = await apiClient.get<NotificationResponse[]>('/api/notifications');
    console.log('[Notifications] response:', res.status, Array.isArray(res.data) ? res.data.length : 'n/a');
    return (res.data || []).map(mapNotification);
  },
  async markAllRead(): Promise<{ success: boolean; message: string }> {
    console.log('[Notifications] PUT /api/notifications/mark-all-read');
    const res = await apiClient.put<{ success: boolean; message: string }>(
      '/api/notifications/mark-all-read',
      {},
    );
    console.log('[Notifications] mark-all-read response================:', res.status, res.data);
    return res.data;
  },
  async markAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    console.log('[Notifications] PUT /api/notifications/' + notificationId + '/mark-read');
    const res = await apiClient.put<{ success: boolean; message: string }>(
      `/api/notifications/${notificationId}/mark-read`,
      {},
    );
    console.log('[Notifications] mark-read response:', res.status, res.data);
    return res.data;
  },
};

export const fetchNotifications = notificationsApi.getAll;
export const markAllNotificationsRead = notificationsApi.markAllRead;
export const markNotificationAsRead = notificationsApi.markAsRead;


