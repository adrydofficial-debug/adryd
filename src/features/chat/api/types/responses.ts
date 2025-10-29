// src/features/chat/api/types/responses.ts

export interface ChatMessageResponse {
  id: number;
  content: string;
  sender_id: string;
  message_type: string;
  is_ai_generated: boolean;
  ai_status: 'pending' | 'processing' | 'completed' | 'failed' | null;
  created_at: string;
  seen: boolean;
  chat_id?: number;
}

export interface ChatResponse {
  id: number;
  user_id: string;
  bot_id: string;
  complaint_id: number | null;
  created_at: string;
  updated_at: string;
  messages: ChatMessageResponse[];
}

export interface ChatApiResponse {
  success: boolean;
  data: ChatResponse;
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    userMessage: ChatMessageResponse;
    chat_id?: number;
  };
}

