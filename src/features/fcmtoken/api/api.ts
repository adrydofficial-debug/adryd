import apiClient from '../../../services/apiClient';

export interface RegisterFcmTokenRequest {
  token: string;
}

export interface RegisterFcmTokenResponse {
  success: boolean;
  message: string;
}

export const fcmTokenApi = {
  async registerToken(token: string): Promise<RegisterFcmTokenResponse> {
    console.log('[FCM] Register token → POST /api/tokens', token?.slice(0, 8) + '...');
    const res = await apiClient.post<RegisterFcmTokenResponse>(
      '/api/tokens',
      { token } as RegisterFcmTokenRequest,
    );
    console.log('[FCM] ==============================Register token response:', res.data);
    return res.data;
  },
};

export const registerFcmToken = fcmTokenApi.registerToken;


