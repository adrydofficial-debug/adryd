// src/features/users/api/api.ts

import apiClient from '../../../services/apiClient';
import { UserUploadInfoResponse } from './types/responses';
import { UserUploadRequest } from './types/requests';

/* -------------------------------------------------------------------------- */
/* 👤 USER API                                                               */
/* -------------------------------------------------------------------------- */

export const profileApi = {
  /** 🔹 Generate a signed upload URL for the user's profile picture */
  async getAvatarUploadUrl(
    data: UserUploadRequest,
  ): Promise<UserUploadInfoResponse> {
    try {
      console.log('📤 Sending avatar upload URL request:', data);

      const response = await apiClient.post<UserUploadInfoResponse>(
        '/api/users/upload-avatar-url',
        data,
      );

      console.log('🧾 Avatar upload URL response:', response.data);

      if (!response.data) {
        throw new Error('Empty response from backend while fetching upload URL');
      }

      return response.data;
    } catch (err: any) {
      console.error('❌ Failed to get avatar upload URL:', err?.message || err);
      if (err?.response) {
        console.error('🔍 Response data:', err.response.data);
        console.error('🔍 Status:', err.response.status);
      } else if (err?.request) {
        console.error('📡 No response received from server:', err.request);
      } else {
        console.error('⚙️ Unexpected error:', err);
      }

      throw err; // rethrow so the hook mutation still triggers `onError`
    }
  },
};


export const getUserAvatarUploadUrl = profileApi.getAvatarUploadUrl;
