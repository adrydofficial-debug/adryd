import { create } from 'zustand';
import { NotificationEntity } from '../api/api';

type NotificationsState = {
  notifications: NotificationEntity[];
  hasUnread: boolean;

  setNotifications: (items: NotificationEntity[]) => void;
  upsertNotification: (item: NotificationEntity) => void;
  removeNotification: (id: string) => void;

  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

export const useNotificationsStore = create<NotificationsState>(set => ({
  notifications: [],
  hasUnread: false,

  setNotifications: items =>
    set({
      notifications: items,
      hasUnread: items.some(n => !n.read),
    }),

  upsertNotification: item =>
    set(state => {
      const exists = state.notifications.find(n => n.id === item.id);
      const updated = exists
        ? state.notifications.map(n => (n.id === item.id ? item : n))
        : [item, ...state.notifications];

      return {
        notifications: updated,
        hasUnread: updated.some(n => !n.read),
      };
    }),

  removeNotification: id =>
    set(state => {
      const updated = state.notifications.filter(n => n.id !== id);
      return {
        notifications: updated,
        hasUnread: updated.some(n => !n.read),
      };
    }),

  markAsRead: id =>
    set(state => {
      const updated = state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n,
      );

      return {
        notifications: updated,
        hasUnread: updated.some(n => !n.read),
      };
    }),

  markAllAsRead: () =>
    set(state => {
      const updated = state.notifications.map(n => ({ ...n, read: true }));
      return {
        notifications: updated,
        hasUnread: false,
      };
    }),
}));
