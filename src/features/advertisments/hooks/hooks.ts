import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { advertisementsApi } from '../api/api';
import type {
  Advertisement,
  PaginatedAdvertisements,
} from '../domain/entities';
import {
  mapAdvertisement,
  mapPaginatedAdvertisements,
} from '../domain/mappers';

/* === Queries === */

// list
export const useAdvertisements = (opts?: {
  page?: number;
  limit?: number;
  status?: string;
}) =>
  useQuery<PaginatedAdvertisements>({
    queryKey: ['advertisements', opts ?? {}],
    queryFn: async () => {
      const res = await advertisementsApi.getAdvertisements(opts);
      return mapPaginatedAdvertisements(res) as PaginatedAdvertisements;
    },
    placeholderData: keepPreviousData,
  });

// single
export const useAdvertisement = (id?: number) =>
  useQuery<Advertisement>({
    queryKey: ['advertisement', id],
    queryFn: async () => {
      if (!id) throw new Error('Missing id');
      const res = await advertisementsApi.getAdvertisementById(id);
      return mapAdvertisement(res) as Advertisement;
    },
    enabled: !!id,
  });

/* === Mutations === */

export const useCreateAdvertisement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await advertisementsApi.createAdvertisement(payload);
      return mapAdvertisement(res) as Advertisement;
    },
    onSuccess: created => {
      qc.invalidateQueries({ queryKey: ['advertisements'] });
      qc.setQueryData(['advertisement', created.id], created);
    },
  });
};

export const useUpdateAdvertisement = (id?: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      if (!id) throw new Error('Missing id');
      const res = await advertisementsApi.updateAdvertisement(id, payload);
      return mapAdvertisement(res) as Advertisement;
    },
    onSuccess: updated => {
      qc.invalidateQueries({ queryKey: ['advertisements'] });
      if (updated.id) qc.setQueryData(['advertisement', updated.id], updated);
    },
  });
};

export const useDeleteAdvertisement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await advertisementsApi.deleteAdvertisement(id);
      return id;
    },
    onSuccess: id => {
      qc.invalidateQueries({ queryKey: ['advertisements'] });
      qc.removeQueries({ queryKey: ['advertisement', id] });
    },
  });
};

export const useChangeAdvertisementStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      new_status,
    }: {
      id: number;
      new_status: string;
    }) => {
      const res = await advertisementsApi.changeStatus(id, { new_status });
      return res;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['advertisements'] });
      qc.invalidateQueries({ queryKey: ['advertisement', vars.id] });
    },
  });
};

/* Upload URL and download URL hooks (simple) */

export const useGetUploadUrl = () =>
  useMutation({
    mutationFn: async (payload: { filename: string; contentType: string }) => {
      return advertisementsApi.getUploadUrl(payload);
    },
  });
