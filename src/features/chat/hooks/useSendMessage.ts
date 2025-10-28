// src/features/chat/hooks/useSendMessage.ts

import { useCallback } from 'react';
import { sendChatMessage } from '../api/api';
import { Message } from '../domain/entities';

interface UseSendMessageProps {
  userId: string;
  currentChatId: number | null;
  onMessageSent: (message: Message) => void;
  onLoadingAdded: (message: Message) => void;
  onMessageReplaced: (tempId: string, realMessage: Message) => void;
  onChatIdUpdated: (chatId: number) => void;
  onError: (error: Error) => void;
  onPollForAI: (chatId: number) => void;
}

export const useSendMessage = ({
  userId,
  currentChatId,
  onMessageSent,
  onLoadingAdded,
  onMessageReplaced,
  onChatIdUpdated,
  onError,
  onPollForAI,
}: UseSendMessageProps) => {
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !userId) return;

      const userMessageText = text.trim();

      // Create temporary user message for optimistic UI update
      const tempUserMessageId = `temp-${Date.now()}`;
      const tempUserMessage: Message = {
        id: tempUserMessageId,
        text: userMessageText,
        isUser: true,
        timestamp: new Date(),
      };

      // Add temporary user message
      onMessageSent(tempUserMessage);

      // Add loading indicator
      const loadingMessage: Message = {
        id: `${Date.now()}-loading`,
        text: '',
        isUser: false,
        timestamp: new Date(),
        isLoading: true,
        aiStatus: 'pending',
      };
      onLoadingAdded(loadingMessage);

      try {
        const response = await sendChatMessage({
          content: userMessageText,
          message_type: 'text',
          chat_id: currentChatId || undefined,
        });

        if (response.success) {
          const responseData = response.data;

          if (responseData.userMessage) {
            const apiUserMessage = responseData.userMessage;

            // Replace temporary message with actual API response
            const realMessage: Message = {
              id: apiUserMessage.id.toString(),
              text: apiUserMessage.content,
              isUser: true,
              timestamp: new Date(apiUserMessage.created_at),
              messageId: apiUserMessage.id,
            };

            onMessageReplaced(tempUserMessageId, realMessage);

            // Handle chat_id
            let newChatId = currentChatId;

            if (apiUserMessage.chat_id) {
              newChatId = apiUserMessage.chat_id;
            } else if (responseData.chat_id) {
              newChatId = responseData.chat_id;
            }

            // Update chat ID if we got a new one
            if (!currentChatId && newChatId) {
              onChatIdUpdated(newChatId);
            }

            // Fallback: Poll for AI message if Realtime doesn't work
            const chatIdForPolling = newChatId || currentChatId;
            if (chatIdForPolling) {
              setTimeout(() => {
                onPollForAI(chatIdForPolling);
              }, 2000);
            }
          }
        }
      } catch (error: any) {
        onError(
          new Error(
            error?.response?.data?.message ||
              "Sorry, I'm having trouble connecting. Please try again."
          )
        );
      }
    },
    [
      userId,
      currentChatId,
      onMessageSent,
      onLoadingAdded,
      onMessageReplaced,
      onChatIdUpdated,
      onError,
      onPollForAI,
    ]
  );

  return { sendMessage };
};

