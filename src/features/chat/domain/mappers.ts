// src/features/chat/domain/mappers.ts

import { ChatMessageResponse, ChatResponse } from '../api/types/responses';
import { Message, Chat } from './entities';

/**
 * Map API message response to domain Message entity
 */
export const mapMessage = (
  msg: ChatMessageResponse,
  currentUserId: string,
): Message => ({
  id: msg.id.toString(),
  text: msg.content,
  isUser: msg.sender_id === currentUserId || (!msg.is_ai_generated && msg.sender_id !== 'adryd-bot'),
  timestamp: new Date(msg.created_at),
  isLoading: msg.ai_status === 'pending' || msg.ai_status === 'processing',
  aiStatus: msg.ai_status || undefined,
  messageId: msg.id,
});

/**
 * Map API chat response to domain Chat entity
 */
export const mapChat = (data: ChatResponse, currentUserId: string): Chat => ({
  id: data.id,
  userId: data.user_id,
  botId: data.bot_id,
  messages: data.messages
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(msg => mapMessage(msg, currentUserId)),
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

