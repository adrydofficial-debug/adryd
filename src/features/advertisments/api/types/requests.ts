// src/features/advertisements/api/requests.ts
import { AdvertisementStatus } from '../../domain/entities';

export interface CreateAdvertisementRequest {
  company_id: number;
  board_id: number;
  title: string;
  description?: string;
  total_payment?: number;
  bookings?: { start_at: string; end_at: string }[];
  media?: { url: string; filename: string; size: number; type: string }[];
}

export interface UpdateAdvertisementRequest {
  title?: string;
  description?: string;
  total_payment?: number;
  media?: { url: string; filename: string; size: number; type: string }[];
}

export interface ChangeAdvertisementStatusRequest {
  new_status: AdvertisementStatus;
}

export interface GenerateUploadUrlRequest {
  filename: string;
  contentType: string;
}
