// src/features/chat/hooks/useRealtimeMessages.ts

import { useCallback, useRef } from 'react';
import { supabase } from '../../../services/supabase';
import { Message } from '../domain/entities';

interface UseRealtimeMessagesProps {
  userId: string;
  onMessageInsert: (message: Message) => void;
  onMessageUpdate: (message: Message) => void;
  flatListRef: React.RefObject<any>;
}

export const useRealtimeMessages = ({
  userId,
  onMessageInsert,
  onMessageUpdate,
  flatListRef,
}: UseRealtimeMessagesProps) => {
  const realtimeChannelRef = useRef<any>(null);

  const setupRealtimeListener = useCallback(
    (chatId: number | null) => {
      if (!chatId) return;

      // Clean up existing channel
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
      }

      // Create a channel for this specific chat
      const channel = supabase
        .channel(`chat:${chatId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_messages',
            filter: `chat_id=eq.${chatId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newMessage = payload.new;

              const isUserMessage =
                newMessage.sender_id === userId ||
                (!newMessage.is_ai_generated && newMessage.sender_id !== 'adryd-bot');

              const message: Message = {
                id: newMessage.id.toString(),
                text: newMessage.content || '',
                isUser: isUserMessage,
                timestamp: new Date(newMessage.created_at),
                isLoading:
                  !isUserMessage &&
                  (newMessage.ai_status === 'pending' ||
                    newMessage.ai_status === 'processing'),
                aiStatus: newMessage.ai_status || undefined,
                messageId: newMessage.id,
              };

              onMessageInsert(message);

              // Scroll to bottom when new message arrives
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            } else if (payload.eventType === 'UPDATE') {
              const updatedMessage = payload.new;

              const message: Message = {
                id: updatedMessage.id.toString(),
                text: updatedMessage.content || '',
                isUser:
                  updatedMessage.sender_id === userId ||
                  (!updatedMessage.is_ai_generated &&
                    updatedMessage.sender_id !== 'adryd-bot'),
                timestamp: new Date(updatedMessage.created_at),
                isLoading:
                  updatedMessage.ai_status === 'pending' ||
                  updatedMessage.ai_status === 'processing',
                aiStatus: updatedMessage.ai_status || undefined,
                messageId: updatedMessage.id,
              };

              onMessageUpdate(message);

              // Scroll to bottom when message is updated
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }
          }
        )
        .subscribe();

      realtimeChannelRef.current = channel;
    },
    [userId, onMessageInsert, onMessageUpdate, flatListRef]
  );

  const cleanup = useCallback(() => {
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.unsubscribe();
      realtimeChannelRef.current = null;
    }
  }, []);

  return { setupRealtimeListener, cleanup };
};

