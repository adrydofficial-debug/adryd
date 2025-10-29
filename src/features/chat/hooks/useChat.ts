// src/features/chat/hooks/useChat.ts

import { useState, useCallback, useEffect } from 'react';
import { getChatMessages } from '../api/api';
import { mapChat, mapMessage } from '../domain/mappers';
import { Message } from '../domain/entities';

interface UseChatProps {
  userId: string | undefined;
}

export const useChat = ({ userId }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const welcomeMessage: Message = {
    id: 'welcome',
    text: "Hello! 👋 Ask me anything about Adryd. I'm here to help!",
    isUser: false,
    timestamp: new Date(),
  };

  const loadChatHistory = useCallback(async () => {
    if (!userId) {
      setMessages([welcomeMessage]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getChatMessages();

      if (response.success) {
        const chatData = response.data;

        if (chatData && chatData.id) {
          const chatId = chatData.id;
          setCurrentChatId(chatId);

          // Format and set messages if they exist
          if (chatData.messages && chatData.messages.length > 0) {
            const chat = mapChat(chatData, userId);
            setMessages(chat.messages);
          } else {
            setMessages([welcomeMessage]);
          }
        } else {
          setMessages([welcomeMessage]);
        }
      }
    } catch (error) {
      setMessages([welcomeMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  return {
    messages,
    setMessages,
    currentChatId,
    setCurrentChatId,
    isLoading,
    reloadChat: loadChatHistory,
  };
};

