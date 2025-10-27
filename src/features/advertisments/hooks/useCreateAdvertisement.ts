import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdvertisementPost } from '../api';
import {
  CreateAdvertisementRequest,
  CreateAdvertisementResponse,
} from '../types';

// -----------------------------
// Create Advertisement Hook (Verbose Edition)
// -----------------------------
export const useCreateAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateAdvertisementRequest,
    ): Promise<CreateAdvertisementResponse> => {
      console.group('🟡 [useCreateAdvertisement] Mutation Start');
      console.log('Payload received:', data);

      try {
        console.log('➡️ Calling API: createAdvertisementGet()');
        const response = await createAdvertisementPost(data);
        console.log('✅ API Response:', response);
        return response;
      } catch (error) {
        console.error('❌ API Error (mutationFn):', error);
        throw error;
      } finally {
        console.groupEnd();
      }
    },

    onSuccess: response => {
      console.group('🟢 [useCreateAdvertisement] onSuccess');
      console.log('Response data:', response);
      console.log('🌀 Invalidating "advertisements" query cache...');
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      console.groupEnd();
    },

    onError: error => {
      console.group('🔴 [useCreateAdvertisement] onError');
      console.error('Error details:', error);
      if ((error as any)?.response) {
        console.error('Server response:', (error as any).response);
      }
      console.groupEnd();
    },

    onSettled: (data, error) => {
      console.group('⚪ [useCreateAdvertisement] onSettled');
      if (data) console.log('Settled with data:', data);
      if (error) console.log('Settled with error:', error);
      console.groupEnd();
    },
  });
};
