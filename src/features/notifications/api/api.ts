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
}

function mapNotification(n: NotificationResponse): NotificationEntity {
  return {
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type,
    read: n.read,
    createdAt: n.created_at,
  };
}

export const notificationsApi = {
  async getAll(): Promise<NotificationEntity[]> {
    console.log('[Notifications] GET /api/notifications');
    const res = await apiClient.get<NotificationResponse[]>('/api/notifications');
    console.log('[Notifications] response:', res.status, Array.isArray(res.data) ? res.data.length : 'n/a');
    return (res.data || []).map(mapNotification);
  },
};

export const fetchNotifications = notificationsApi.getAll;


