// src/features/advertisements/api/requests.ts
import { AdvertisementStatus } from '../../domain/entities';

export interface CreateAdvertisementRequest {
  company_id?: number | null; // Optional for individual flow - can be null or omitted
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
  advertisement_id?: number; // Optional: required for existing draft advertisements
}

// Temporary bookings (selected dates before submission)
export interface CreateTemporaryBookingRequest {
  board_id: number;
  dates: string[]; // Array of dates in YYYY-MM-DD format
}

export interface DeleteTemporaryBookingRequest {
  board_id: number;
  date: string; // Date in YYYY-MM-DD format
}