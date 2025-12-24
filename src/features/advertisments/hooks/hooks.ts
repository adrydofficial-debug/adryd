// src/features/advertisements/hooks/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  addAdvertisementMedia,
  changeAdvertisementStatus,
  createAdvertisement,
  deleteAdvertisement,
  generateUploadUrl,
  getAdvertisement,
  getAdvertisements,
  updateAdvertisement,
  getTemporaryBookings,
  createTemporaryBookings,
  deleteTemporaryBooking,
  clearTemporaryBookings,
} from '../api/api';
import { Advertisement, AdvertisementStatus } from '../domain/entities';
import {
  mapAdvertisement,
  mapCreateAdvertisementRequest,
  mapUpdateAdvertisementRequest,
} from '../domain/mappers';

import { uploadToSignedUrl } from '../../../services/uploadFile';

export interface UploadFile {
  uri: string;
  type: string;
  name: string;
}

interface UploadArgs {
  uploadUrl: string;
  files: UploadFile[];
}

export function useUploadAdvertisementFiles() {
  return useMutation<void, Error, UploadArgs>({
    mutationFn: async ({ uploadUrl, files }) => {
      console.log('🔵 [useUploadAdvertisementFiles] Mutation function called');
      console.log('🔵 [useUploadAdvertisementFiles] Upload URL:', uploadUrl);
      console.log('🔵 [useUploadAdvertisementFiles] Files count:', files?.length || 0);
      console.log('🔵 [useUploadAdvertisementFiles] Files:', JSON.stringify(files, null, 2));
      
      if (!uploadUrl) {
        console.error('❌ [useUploadAdvertisementFiles] No upload URL provided');
        throw new Error('No upload URL provided');
      }
      if (!files || files.length === 0) {
        console.error('❌ [useUploadAdvertisementFiles] No files provided for upload');
        throw new Error('No files provided for upload');
      }

      console.log('🔄 [useUploadAdvertisementFiles] Starting file upload loop...');
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 [useUploadAdvertisementFiles] Uploading file ${i + 1}/${files.length}:`, {
          name: file.name,
          type: file.type,
          uri: file.uri.substring(0, 50) + '...',
        });
        
        try {
          await uploadToSignedUrl(uploadUrl, file);
          console.log(`✅ [useUploadAdvertisementFiles] File ${i + 1}/${files.length} uploaded successfully`);
        } catch (error: any) {
          console.error(`❌ [useUploadAdvertisementFiles] Failed to upload file ${i + 1}/${files.length}:`, error);
          console.error(`❌ [useUploadAdvertisementFiles] Error details:`, {
            name: error?.name,
            message: error?.message,
            stack: error?.stack,
          });
          throw error;
        }
      }
      
      console.log('✅ [useUploadAdvertisementFiles] All files uploaded successfully');
    },
  });
}

// --- QUERY KEYS ---
const AD_KEYS = {
  all: ['advertisements'] as const,
  lists: () => [...AD_KEYS.all, 'list'] as const,
  list: (filters: { page?: number; limit?: number; status?: string }) =>
    [...AD_KEYS.lists(), filters] as const,
  detail: (id: number) => [...AD_KEYS.all, 'detail', id] as const,
};

// --- LOCAL STATE: upload URL cache ---
let uploadCache: {
  advertisementId: number;
  uploadUrl: string;
  key: string;
  publicUrl: string;
} | null = null;

// --- HOOKS ---

// Fetch paginated advertisements
export const useAdvertisements = (
  page = 1,
  limit = 10,
  status?: AdvertisementStatus,
) => {
  return useQuery({
    queryKey: AD_KEYS.list({ page, limit, status }),
    queryFn: async () => {
      const res = await getAdvertisements(page, limit, status);
      return {
        ...res,
        data: res.data.map(mapAdvertisement),
      };
    },
    placeholderData: previousData => previousData,
  });
};

// Fetch single advertisement
export const useAdvertisement = (id?: number) => {
  return useQuery({
    queryKey: id ? AD_KEYS.detail(id) : [],
    queryFn: async () => {
      if (!id) throw new Error('Advertisement ID is required');
      const res = await getAdvertisement(id);
      return mapAdvertisement(res);
    },
    enabled: !!id,
  });
};

// Create new advertisement (stores upload URL)
export const useCreateAdvertisement = () => {
  const queryClient = useQueryClient();
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: Partial<Advertisement>) => {
      const payload = mapCreateAdvertisementRequest(data);
      const res = await createAdvertisement(payload);
      uploadCache = {
        advertisementId: res.advertisement.id,
        uploadUrl: res.upload.uploadUrl,
        key: res.upload.key,
        publicUrl: res.upload.publicUrl,
      };
      setUploadUrl(res.upload.uploadUrl);
      setPublicUrl(res.upload.publicUrl);
      return mapAdvertisement(res.advertisement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AD_KEYS.lists() });
    },
  });

  return {
    ...mutation,
    uploadUrl,
    publicUrl,
  };
};

// Update advertisement
export const useUpdateAdvertisement = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Advertisement>) => {
      const payload = mapUpdateAdvertisementRequest(data);
      const res = await updateAdvertisement(id, payload);
      return mapAdvertisement(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AD_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: AD_KEYS.lists() });
    },
  });
};

// Change advertisement status
export const useChangeAdvertisementStatus = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (new_status: AdvertisementStatus) => {
      const res = await changeAdvertisementStatus(id, { new_status });
      return mapAdvertisement(res);
    },
    onSuccess: (data, new_status) => {
      queryClient.invalidateQueries({ queryKey: AD_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: AD_KEYS.lists() });
      
      // Invalidate campaign chats to show status update message
      queryClient.invalidateQueries({ queryKey: ['campaignChats'] });
      queryClient.invalidateQueries({ queryKey: ['campaignMessages', id] });
      
      // Note: Backend should automatically create a status_update message
      // when status changes. If not, you may need to call an API endpoint
      // to send the status update message here.
    },
  });
};

// Generate upload URL manually (in case of later uploads)
export const useGenerateUploadUrl = () => {
  return useMutation({
    mutationFn: generateUploadUrl,
    onSuccess: res => {
      uploadCache = {
        advertisementId: 0, // unknown until media linked
        uploadUrl: res.uploadUrl,
        key: res.key,
        publicUrl: res.publicUrl,
      };
    },
  });
};

// Add advertisement media
export const useAddAdvertisementMedia = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      media: { url: string; filename: string; size: number; type: string }[],
    ) => {
      const res = await addAdvertisementMedia(id, media);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AD_KEYS.detail(id) });
    },
  });
};

// Delete advertisement
export const useDeleteAdvertisement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdvertisement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AD_KEYS.lists() });
    },
  });
};

// --- Helper to access latest upload URL globally ---
export const getLastUploadUrl = () => uploadCache;

// ==================== GLOBAL SELECTED DATES HOOKS (TanStack Query) ====================
// These hooks manage selected dates using TanStack Query with AsyncStorage persistence
// This provides reactive updates across all components and persists data locally

import AsyncStorage from '@react-native-async-storage/async-storage';

// Use a shared storage key so ALL users on the same device see each other's selected dates
// This works across different user logins on the same device
// For cross-device sync, you would need Supabase (see alternative solution below)
const GLOBAL_SELECTED_DATES_KEY = 'global-selected-dates-shared';
const SELECTED_DATES_QUERY_KEY = ['global-selected-dates-shared'] as const;

/**
 * Helper function to normalize date to YYYY-MM-DD format
 */
const normalizeDate = (date: Date | string): string => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  // If it's already a string, try to parse it
  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return date; // Return as-is if can't parse
};

/**
 * Hook to fetch global selected dates from AsyncStorage
 * Returns dates that users have selected (marked as booked for all users)
 * Uses TanStack Query for reactive updates across components
 * 
 * NOTE: This uses shared storage on the same device
 * ✅ Different users on same device: Will see each other's dates
 * ❌ Same user on different devices: Will NOT see dates (device-specific storage)
 * 
 * For cross-device sync without custom API, you can use Supabase Realtime (see alternative below)
 */
export const useGlobalSelectedDates = () => {
  return useQuery({
    queryKey: SELECTED_DATES_QUERY_KEY,
    queryFn: async (): Promise<string[]> => {
      try {
        const stored = await AsyncStorage.getItem(GLOBAL_SELECTED_DATES_KEY);
        if (stored) {
          const dates = JSON.parse(stored) as string[];
          // Normalize all dates to YYYY-MM-DD format
          return dates.map(normalizeDate).filter(Boolean);
        }
        return [];
      } catch (error) {
        console.error('Error reading global selected dates:', error);
        return [];
      }
    },
    staleTime: 0, // Always consider data stale to get latest updates
    gcTime: Infinity, // Keep in cache indefinitely
    placeholderData: () => [], // Default to empty array
    refetchInterval: 2000, // Refetch every 2 seconds to catch changes from other users
  });
};

/**
 * Hook to add a date to global selected dates
 * Uses TanStack Query mutation for reactive updates
 */
export const useAddGlobalSelectedDate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (date: Date | string): Promise<string[]> => {
      const normalized = normalizeDate(date);
      
      // Get current dates
      const currentData = queryClient.getQueryData<string[]>(SELECTED_DATES_QUERY_KEY) || [];
      const current = currentData.map(normalizeDate);
      
      // Add if not already present
      if (!current.includes(normalized)) {
        const updated = [...current, normalized];
        
        // Save to AsyncStorage
        await AsyncStorage.setItem(GLOBAL_SELECTED_DATES_KEY, JSON.stringify(updated));
        console.log('✅ Added date to global selected dates (TanStack Query):', normalized);
        
        return updated;
      }
      
      return current;
    },
    onSuccess: (data) => {
      // Update cache immediately for reactive updates
      queryClient.setQueryData(SELECTED_DATES_QUERY_KEY, data);
    },
  });
};

/**
 * Hook to remove a date from global selected dates
 * Uses TanStack Query mutation for reactive updates
 */
export const useRemoveGlobalSelectedDate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (date: Date | string): Promise<string[]> => {
      const normalized = normalizeDate(date);
      
      // Get current dates
      const currentData = queryClient.getQueryData<string[]>(SELECTED_DATES_QUERY_KEY) || [];
      const current = currentData.map(normalizeDate);
      
      // Remove the date
      const updated = current.filter(d => d !== normalized);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(GLOBAL_SELECTED_DATES_KEY, JSON.stringify(updated));
      console.log('✅ Removed date from global selected dates (TanStack Query):', normalized);
      
      return updated;
    },
    onSuccess: (data) => {
      // Update cache immediately for reactive updates
      queryClient.setQueryData(SELECTED_DATES_QUERY_KEY, data);
    },
  });
};

/**
 * Hook to clear all global selected dates
 * Uses TanStack Query mutation for reactive updates
 */
export const useClearGlobalSelectedDates = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<string[]> => {
      // Clear AsyncStorage
      await AsyncStorage.removeItem(GLOBAL_SELECTED_DATES_KEY);
      console.log('✅ Cleared all global selected dates (TanStack Query)');
      
      return [];
    },
    onSuccess: (data) => {
      // Update cache immediately for reactive updates
      queryClient.setQueryData(SELECTED_DATES_QUERY_KEY, data);
    },
  });
};