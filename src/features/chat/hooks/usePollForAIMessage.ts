// src/features/chat/hooks/usePollForAIMessage.ts

import { useCallback } from 'react';
import { getChatMessages } from '../api/api';
import { mapMessage } from '../domain/mappers';
import { Message } from '../domain/entities';

interface UsePollForAIMessageProps {
  userId: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  flatListRef: React.RefObject<any>;
}

export const usePollForAIMessage = ({
  userId,
  messages,
  setMessages,
  flatListRef,
}: UsePollForAIMessageProps) => {
  const pollForAIMessage = useCallback(
    (chatId: number | null, maxAttempts = 15) => {
      if (!chatId) return;

      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;

        try {
          const response = await getChatMessages();
          if (response.success && response.data?.messages) {
            const apiMessages = response.data.messages;

            // Find the latest AI message that we don't have yet
            const latestAIMessage = apiMessages
              .filter(
                (msg: any) =>
                  msg.is_ai_generated && msg.sender_id === 'adryd-bot'
              )
              .sort(
                (a: any, b: any) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )[0];

            if (latestAIMessage) {
              setMessages((prev) => {
                const exists = prev.some(
                  (msg) => msg.messageId === latestAIMessage.id
                );
                if (exists) {
                  clearInterval(pollInterval);
                  return prev;
                }

                const newMessage = mapMessage(latestAIMessage, userId);

                // Replace loading message with AI response
                const updated = prev
                  .map((msg) => {
                    if (msg.isLoading && !msg.isUser) {
                      return newMessage;
                    }
                    return msg;
                  })
                  .filter((msg) => !(msg.isLoading && !msg.messageId));

                if (
                  updated.length !== prev.length ||
                  !prev.some((m) => m.isLoading && !m.messageId)
                ) {
                  clearInterval(pollInterval);
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }

                return updated;
              });
            }
          }
        } catch (error) {
          // Silently handle polling errors
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
        }
      }, 2000);

      return () => {
        clearInterval(pollInterval);
      };
    },
    [userId, messages, setMessages, flatListRef]
  );

  return { pollForAIMessage };
};

