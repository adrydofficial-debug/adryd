// src/features/advertisements/api/api.ts
import apiClient from '../../../services/apiClient';
import {
  ChangeAdvertisementStatusRequest,
  CreateAdvertisementRequest,
  GenerateUploadUrlRequest,
  UpdateAdvertisementRequest,
  GenerateChatMediaUploadUrlRequest,
} from './types/requests';
import {
  AdvertisementUploadResponse,
  CreateAdvertisementResponse,
  PaginatedAdvertisementsResponse,
  SingleAdvertisementResponse,
  TemporaryBookingsResponse,
   ChatMediaUploadResponse,
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
  // Build query parameters - NO ID, NO USER FILTERING
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  // Only add status if explicitly provided (we pass undefined to get ALL)
  if (status && status !== 'undefined') {
    params.append('status', status);
  }
  
  // Construct endpoint - should be: /api/advertisements?page=1&limit=10
  // NO ID in the path, NO user_id in params
  const endpoint = `${BASE}?${params.toString()}`;
  
  console.log('🔵 API CALL - getAdvertisements (NO FILTERS):', {
    fullEndpoint: endpoint,
    basePath: BASE,
    queryParams: params.toString(),
    page,
    limit,
    status: status || 'NONE (fetching all)',
    note: 'This should fetch ALL advertisements, not filtered by ID or user',
  });
  
  const { data } = await apiClient.get(endpoint);
  
  console.log('🟢 API RESPONSE - getAdvertisements:', {
    total: data?.total,
    page: data?.page,
    limit: data?.limit,
    dataCount: Array.isArray(data?.data) ? data.data.length : 0,
    firstItemId: data?.data?.[0]?.id,
    lastItemId: data?.data?.[data?.data?.length - 1]?.id,
    allIds: Array.isArray(data?.data) ? data.data.map((item: any) => item.id) : [],
    allUserIds: Array.isArray(data?.data) ? data.data.map((item: any) => item.user_id) : [],
    warning: data?.total && Array.isArray(data?.data) && data.data.length < data.total 
      ? `⚠️ API returned ${data.data.length} items but total is ${data.total} - need to fetch more pages`
      : 'OK',
  });
  
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
  // If advertisement_id is provided, use the ID in the URL path (for existing drafts)
  if (payload.advertisement_id) {
    const { advertisement_id, ...restPayload } = payload;
    const endpoint = `${BASE}/${advertisement_id}/upload-url`;
    console.log('🔵 [generateUploadUrl] Generating URL for existing advertisement:', {
      advertisement_id,
      endpoint,
      payload: restPayload,
    });
    const { data } = await apiClient.post(endpoint, restPayload);
    console.log('✅ [generateUploadUrl] Upload URL generated successfully');
    return data;
  }
  // Otherwise use the general endpoint (for new advertisements)
  console.log('🔵 [generateUploadUrl] Generating URL for new advertisement:', {
    endpoint: `${BASE}/upload-url`,
    payload,
  });
  const { data } = await apiClient.post(`${BASE}/upload-url`, payload);
  console.log('✅ [generateUploadUrl] Upload URL generated successfully');
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

export const generateChatMediaUploadUrl = async (
  payload: GenerateChatMediaUploadUrlRequest,
): Promise<ChatMediaUploadResponse> => {
  const { data } = await apiClient.post(`${BASE}/upload-url`, {
    filename: payload.filename,
    contentType: payload.contentType,
    advertisement_id: payload.advertisement_id,
  });
  return data;
};