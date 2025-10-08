//src/features/notifications/Notification.ts
export interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: Date;
}
