import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdvertisementGet } from '../api';
import { CreateAdvertisementRequest, CreateAdvertisementResponse } from '../types';

// -----------------------------
// Create Advertisement Hook
// -----------------------------
export const useCreateAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAdvertisementRequest): Promise<CreateAdvertisementResponse> => {
      console.log('Creating advertisement with data:', data);
      const response = await createAdvertisementGet(data);
      return response;
    },
    onSuccess: (response) => {
      console.log('Advertisement created successfully:', response);
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
    onError: (error) => {
      console.error('Error creating advertisement:', error);
    },
  });
};