// src/features/chat/api/api.ts

import apiClient from '../../../services/apiClient';
import { SendMessageRequest } from './types/requests';
import { ChatApiResponse, SendMessageResponse } from './types/responses';

// 📋 Get chat messages
export const getChatMessages = (): Promise<ChatApiResponse> =>
  apiClient.get<ChatApiResponse>('/api/chat/messages').then(res => res.data);

// 📤 Send a chat message
export const sendChatMessage = (
  data: SendMessageRequest,
): Promise<SendMessageResponse> =>
  apiClient.post<SendMessageResponse>('/api/chat/send', data).then(res => res.data);

