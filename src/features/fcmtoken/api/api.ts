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
  async deleteToken(token: string): Promise<RegisterFcmTokenResponse> {
    const path = `/api/tokens/${encodeURIComponent(token)}`;
    console.log('[FCM] Delete token → DELETE', path);
    const res = await apiClient.delete<RegisterFcmTokenResponse>(path);
    console.log('[FCM] Delete token response:', res.status, res.data);
    return res.data;
  },
};

export const registerFcmToken = fcmTokenApi.registerToken;
export const deleteFcmToken = fcmTokenApi.deleteToken;


