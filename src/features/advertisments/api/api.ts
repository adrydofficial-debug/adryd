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
  TemporaryBookingsResponse,
} from './types/responses';
import {
  CreateTemporaryBookingRequest,
} from './types/requests';

const BASE = '/api/advertisements';

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
  console.log('🔵 [addAdvertisementMedia] API call started');
  console.log('🔵 [addAdvertisementMedia] Advertisement ID:', id);
  console.log('🔵 [addAdvertisementMedia] Media array:', JSON.stringify(media, null, 2));
  console.log('🔵 [addAdvertisementMedia] Endpoint:', `${BASE}/${id}/media`);
  
  try {
    const { data } = await apiClient.post(`${BASE}/${id}/media`, { media });
    console.log('✅ [addAdvertisementMedia] API call successful');
    console.log('✅ [addAdvertisementMedia] Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error: any) {
    console.error('❌ [addAdvertisementMedia] API call failed');
    console.error('❌ [addAdvertisementMedia] Error:', error);
    console.error('❌ [addAdvertisementMedia] Error message:', error?.message);
    console.error('❌ [addAdvertisementMedia] Error response:', error?.response?.data);
    throw error;
  }
};

// ==================== TEMPORARY BOOKINGS API ====================
// These endpoints handle selected dates before advertisement submission
// They allow cross-user visibility of selected dates

/**
 * Get all temporary bookings for a specific board
 * This returns dates that users have selected but not yet submitted
 */
export const getTemporaryBookings = async (
  boardId: number,
): Promise<TemporaryBookingsResponse> => {
  const { data } = await apiClient.get(`${BASE}/temporary-bookings`, {
    params: { board_id: boardId },
  });
  return data;
};

/**
 * Create temporary bookings (mark dates as selected/booked)
 * This is called when a user selects dates in the calendar
 */
export const createTemporaryBookings = async (
  payload: CreateTemporaryBookingRequest,
): Promise<TemporaryBookingsResponse> => {
  const { data } = await apiClient.post(`${BASE}/temporary-bookings`, payload);
  return data;
};

/**
 * Delete a temporary booking (unmark a date as selected)
 * This is called when a user deselects a date
 */
export const deleteTemporaryBooking = async (
  boardId: number,
  date: string,
): Promise<{ message: string }> => {
  const { data } = await apiClient.delete(`${BASE}/temporary-bookings`, {
    params: { board_id: boardId, date },
  });
  return data;
};

/**
 * Clear all temporary bookings for the current user
 * This is called after successful advertisement creation
 */
export const clearTemporaryBookings = async (
  boardId: number,
): Promise<{ message: string }> => {
  const { data } = await apiClient.delete(`${BASE}/temporary-bookings/clear`, {
    params: { board_id: boardId },
  });
  return data;
};
