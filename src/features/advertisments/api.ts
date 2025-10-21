import {
  AdvertisementWithRelations,
  Advertisement,
  CreateAdvertisementRequest,
  UpdateAdvertisementRequest,
  ChangeStatusRequest,
  AdvertisementQueryParams,
  AdvertisementStatus,
} from './types';
import {
  AdvertisementListResponse,
  AdvertisementResponse,
  CreateAdvertisementResponse,
  UpdateAdvertisementResponse,
  DeleteAdvertisementResponse,
  ChangeStatusResponse,
  ApiResponse,
} from './types/response';
import apiClient from '../../services/apiClient';

// Base API URL - advertisements root (onrender)
const BASE_URL = '/api/advertisements';

// Get all advertisements for the logged-in user
export const getAdvertisements = async (
  params: AdvertisementQueryParams = {}
): Promise<AdvertisementListResponse> => {
  console.log('getAdvertisements - params:', params);
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
  console.log('getAdvertisements - endpoint:', endpoint);
  
  const response = await apiClient.get<AdvertisementListResponse>(endpoint);
  console.log('getAdvertisements - response:', {
    total: response.data?.total,
    page: response.data?.page,
    limit: response.data?.limit,
    dataCount: Array.isArray(response.data?.data) ? response.data.data.length : 0,
  });
  return response.data;
};

// Get a single advertisement by ID
export const getAdvertisementById = async (id: number): Promise<AdvertisementResponse> => {
  console.log('getAdvertisementById - id:', id, 'endpoint:', `${BASE_URL}/${id}`);
  const response = await apiClient.get<AdvertisementResponse>(`${BASE_URL}/${id}`);
  console.log('getAdvertisementById - response keys:', {
    hasData: !!response.data?.data,
    dataId: response.data?.data?.id,
    boardId: response.data?.data?.board?.id,
    companyId: response.data?.data?.company?.id,
    bookingsCount: Array.isArray(response.data?.data?.bookings) ? response.data.data.bookings.length : 0,
  });
  return response.data;
};

// Create a new advertisement (POST method)
export const createAdvertisement = async (
  data: CreateAdvertisementRequest
): Promise<CreateAdvertisementResponse> => {
  console.log('createAdvertisement - data:', data);
  console.log('createAdvertisement - endpoint:', BASE_URL);
  
  try {
    const response = await apiClient.post<CreateAdvertisementResponse>(BASE_URL, data);
    console.log('createAdvertisement - response:', response.data);
    return response.data;
  } catch (error) {
    console.error('createAdvertisement - error:', error);
    throw error;
  }
};

// Create a new advertisement (GET method with query parameters)
export const createAdvertisementGet = async (
  data: CreateAdvertisementRequest
): Promise<CreateAdvertisementResponse> => {
  console.log('createAdvertisementGet - data:', data);
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (typeof data.company_id === 'number') queryParams.append('company_id', String(data.company_id));
  if (typeof data.board_id === 'number') queryParams.append('board_id', String(data.board_id));
  if (data.title) queryParams.append('title', data.title);
  if (data.description) queryParams.append('description', data.description);
  if (typeof data.total_payment === 'number') queryParams.append('total_payment', String(data.total_payment));
  
  // Add booking parameters
  const firstBooking = Array.isArray(data.bookings) && data.bookings[0] ? data.bookings[0] : undefined;
  if (firstBooking?.start_at) queryParams.append('start_at', firstBooking.start_at);
  if (firstBooking?.end_at) queryParams.append('end_at', firstBooking.end_at);
  
  const endpoint = `${BASE_URL}?${queryParams.toString()}`;
  console.log('createAdvertisementGet - endpoint:', endpoint);
  
  try {
    const response = await apiClient.get<CreateAdvertisementResponse>(endpoint);
    console.log('createAdvertisementGet - response:', response.data);
    return response.data;
  } catch (error) {
    console.error('createAdvertisementGet - error:', error);
    throw error;
  }
};

// Update an advertisement
export const updateAdvertisement = async (
  id: number,
  data: UpdateAdvertisementRequest
): Promise<UpdateAdvertisementResponse> => {
  const response = await apiClient.put<UpdateAdvertisementResponse>(`${BASE_URL}/${id}`, data);
  return response.data;
};

// Delete an advertisement
export const deleteAdvertisement = async (id: number): Promise<DeleteAdvertisementResponse> => {
  const response = await apiClient.delete<DeleteAdvertisementResponse>(`${BASE_URL}/${id}`);
  return response.data;
};

// Change advertisement status
export const changeAdvertisementStatus = async (
  id: number,
  data: ChangeStatusRequest
): Promise<ChangeStatusResponse> => {
  const response = await apiClient.post<ChangeStatusResponse>(`${BASE_URL}/${id}/status`, data);
  return response.data;
};

// Convenience methods for common status changes
export const submitAdvertisement = async (id: number): Promise<ChangeStatusResponse> => {
  return changeAdvertisementStatus(id, { new_status: AdvertisementStatus.PENDING });
};

export const cancelAdvertisement = async (id: number): Promise<ChangeStatusResponse> => {
  return changeAdvertisementStatus(id, { new_status: AdvertisementStatus.CANCELLED });
};

export const approveAdvertisement = async (id: number): Promise<ChangeStatusResponse> => {
  return changeAdvertisementStatus(id, { new_status: AdvertisementStatus.APPROVED });
};

export const rejectAdvertisement = async (id: number): Promise<ChangeStatusResponse> => {
  return changeAdvertisementStatus(id, { new_status: AdvertisementStatus.REJECTED });
};

export const activateAdvertisement = async (id: number): Promise<ChangeStatusResponse> => {
  return changeAdvertisementStatus(id, { new_status: AdvertisementStatus.ACTIVE });
};

export const completeAdvertisement = async (id: number): Promise<ChangeStatusResponse> => {
  return changeAdvertisementStatus(id, { new_status: AdvertisementStatus.COMPLETED });
};
