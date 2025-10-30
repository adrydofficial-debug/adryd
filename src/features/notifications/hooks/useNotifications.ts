import { useQuery } from '@tanstack/react-query';
import { fetchNotifications, NotificationEntity } from '../api/api';

export function useNotifications() {
  return useQuery<NotificationEntity[]>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });
}


