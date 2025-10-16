// src/features/advertisements/api/api.ts
import apiClient from '../../../services/apiClient';
import {
  ChangeAdvertisementStatusRequest,
  CreateAdvertisementRequest,
  GenerateUploadUrlRequest,
  UpdateAdvertisementRequest,
} from './types/requests';
import {
  AdvertisementUploadResponse,
  CreateAdvertisementResponse,
  PaginatedAdvertisementsResponse,
  SingleAdvertisementResponse,
} from './types/responses';

const BASE = '/advertisements';

export const getAdvertisements = async (
  page = 1,
  limit = 10,
  status?: string,
): Promise<PaginatedAdvertisementsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status) params.append('status', status);
  const { data } = await apiClient.get(`${BASE}?${params.toString()}`);
  return data;
};

export const getAdvertisement = async (
  id: number,
): Promise<SingleAdvertisementResponse> => {
  const { data } = await apiClient.get(`${BASE}/${id}`);
  return data;
};

export const createAdvertisement = async (
  payload: CreateAdvertisementRequest,
): Promise<CreateAdvertisementResponse> => {
  const { data } = await apiClient.post(BASE, payload);
  return data;
};

export const updateAdvertisement = async (
  id: number,
  payload: UpdateAdvertisementRequest,
): Promise<SingleAdvertisementResponse> => {
  const { data } = await apiClient.put(`${BASE}/${id}`, payload);
  return data;
};

export const deleteAdvertisement = async (
  id: number,
): Promise<{ message: string }> => {
  const { data } = await apiClient.delete(`${BASE}/${id}`);
  return data;
};

export const changeAdvertisementStatus = async (
  id: number,
  payload: ChangeAdvertisementStatusRequest,
): Promise<SingleAdvertisementResponse> => {
  const { data } = await apiClient.post(`${BASE}/${id}/status`, payload);
  return data;
};

export const generateUploadUrl = async (
  payload: GenerateUploadUrlRequest,
): Promise<AdvertisementUploadResponse> => {
  const { data } = await apiClient.post(`${BASE}/upload-url`, payload);
  return data;
};

export const addAdvertisementMedia = async (
  id: number,
  media: { url: string; filename: string; size: number; type: string }[],
): Promise<{ count: number }> => {
  const { data } = await apiClient.post(`${BASE}/${id}/media`, { media });
  return data;
};
