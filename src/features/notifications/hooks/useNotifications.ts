import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase';
import { fetchNotifications, NotificationEntity } from '../api/api';

export function useNotifications() {
  return useQuery<NotificationEntity[]>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });
}

export function useNotificationsStream(userId: string | null) {
  const queryClient = useQueryClient();

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
              switch (payload.eventType) {
                case 'INSERT':
                  return [newRow, ...old];

                case 'UPDATE':
                  return old.map((n) => (n.id === newRow.id ? newRow : n));

                case 'DELETE':
                  const deletedId = payload.old.id;
                  return old.filter((n) => n.id !== deletedId);

                default:
                  return old;
              }
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}