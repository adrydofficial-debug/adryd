// src/features/chat/domain/entities.ts

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  aiStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  messageId?: number;
}

export interface Chat {
  id: number;
  userId: string;
  botId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

