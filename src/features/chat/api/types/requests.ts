// src/features/chat/api/types/requests.ts

export interface SendMessageRequest {
  content: string;
  message_type: 'text';
  chat_id?: number;
}

