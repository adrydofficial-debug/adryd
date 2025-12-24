import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { fetchNotifications, NotificationEntity } from '../api/api';
import { useNotificationsStore } from '../store/notifications';

export function useNotifications() {
  const { setNotifications } = useNotificationsStore();
  
  const query = useQuery<NotificationEntity[]>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  // Sync store when data changes
  useEffect(() => {
    if (query.data) {
      setNotifications(query.data);
    }
  }, [query.data, setNotifications]);

  return query;
}

export function useNotificationsStream(userId: string | null) {
  const queryClient = useQueryClient();
  const { setNotifications } = useNotificationsStore();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Notification',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // snarky side note: supabase gives you full row on insert/update
          const newRow = payload.new as NotificationEntity;

          queryClient.setQueryData<NotificationEntity[]>(
            ['notifications'],
            (old = []) => {
              // handle insert/update/delete correctly
              let updated: NotificationEntity[];
              switch (payload.eventType) {
                case 'INSERT':
                  updated = [newRow, ...old];
                  break;

                case 'UPDATE':
                  updated = old.map((n) => (n.id === newRow.id ? newRow : n));
                  break;

                case 'DELETE':
                  const deletedId = payload.old.id;
                  updated = old.filter((n) => n.id !== deletedId);
                  break;

                default:
                  updated = old;
              }
              
              // Sync store with updated data
              setNotifications(updated);
              
              return updated;
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, setNotifications]);
}