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
} from '../api/api';
import { Advertisement, AdvertisementStatus } from '../domain/entities';
import {
  mapAdvertisement,
  mapCreateAdvertisementRequest,
  mapUpdateAdvertisementRequest,
} from '../domain/mappers';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AD_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: AD_KEYS.lists() });
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
