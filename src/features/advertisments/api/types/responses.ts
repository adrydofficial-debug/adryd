// src/features/advertisements/api/responses.ts
import { Advertisement } from '../../domain/entities';

export interface PaginatedAdvertisementsResponse {
  total: number;
  page: number;
  limit: number;
  data: Advertisement[];
}

export interface AdvertisementUploadResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export interface CreateAdvertisementResponse {
  advertisement: Advertisement;
  upload: AdvertisementUploadResponse;
}

export interface SingleAdvertisementResponse extends Advertisement {}
