// src/features/users/api/referralApi.ts

import apiClient from '../../../services/apiClient';

/* -------------------------------------------------------------------------- */
/* 🔗 REFERRAL API                                                            */
/* -------------------------------------------------------------------------- */

export const referralApi = {
  async getReferredCount(): Promise<number> {
    try {
      console.log('📤 Sending request to fetch referred user count');

      const response = await apiClient.get<{ referred_count: number }>(
        '/api/users/referral-count',
      );

      console.log('🧾 Referred count response:', response.data);

      if (!response.data || typeof response.data.referred_count !== 'number') {
        throw new Error(
          'Invalid or empty response from backend while fetching referred count',
        );
      }

      return response.data.referred_count; // use snake_case from backend
    } catch (err: any) {
      console.error('❌ Failed to fetch referred count:', err?.message || err);
      throw err;
    }
  },
};

// Shortcut export
export const getReferredCount = referralApi.getReferredCount;
