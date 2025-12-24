import { create } from 'zustand';
import { NotificationEntity } from '../api/api';

type NotificationsState = {
  notifications: NotificationEntity[];
  hasUnread: boolean;
  unreadCount: number;

  setNotifications: (items: NotificationEntity[]) => void;
  upsertNotification: (item: NotificationEntity) => void;
  removeNotification: (id: string) => void;

  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

export const useNotificationsStore = create<NotificationsState>(set => ({
  notifications: [],
  hasUnread: false,
  unreadCount: 0,

  setNotifications: items => {
    const unread = items.filter(n => !n.read).length;
    set({
      notifications: items,
      hasUnread: unread > 0,
      unreadCount: unread,
    });
  },

  upsertNotification: item => {
    set(state => {
      const exists = state.notifications.find(n => n.id === item.id);
      const updated = exists
        ? state.notifications.map(n => (n.id === item.id ? item : n))
        : [item, ...state.notifications];

      const unread = updated.filter(n => !n.read).length;
      return {
        notifications: updated,
        hasUnread: unread > 0,
        unreadCount: unread,
      };
    });
  },

  removeNotification: id => {
    set(state => {
      const updated = state.notifications.filter(n => n.id !== id);
      const unread = updated.filter(n => !n.read).length;
      return {
        notifications: updated,
        hasUnread: unread > 0,
        unreadCount: unread,
      };
    });
  },

  markAsRead: id => {
    set(state => {
      const updated = state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n,
      );

      const unread = updated.filter(n => !n.read).length;
      return {
        notifications: updated,
        hasUnread: unread > 0,
        unreadCount: unread,
      };
    });
  },

  markAllAsRead: () => {
    set(state => {
      const updated = state.notifications.map(n => ({ ...n, read: true }));
      return {
        notifications: updated,
        hasUnread: false,
        unreadCount: 0,
      };
    });
  },
}));
