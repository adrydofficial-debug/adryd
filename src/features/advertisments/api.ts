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

// Base API URL - Update this with your actual API base URL
const BASE_URL = 'https://adryd-backend-production.up.railway.app/api/advertisements';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  // Implement your token retrieval logic here
  // This could be from AsyncStorage, Redux store, etc.
  return localStorage.getItem('authToken') || null;
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Get all advertisements for the logged-in user
export const getAdvertisements = async (
  params: AdvertisementQueryParams = {}
): Promise<AdvertisementListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `?${queryString}` : '';
  
  return apiRequest<AdvertisementListResponse>(endpoint);
};

// Get a single advertisement by ID
export const getAdvertisementById = async (id: number): Promise<AdvertisementResponse> => {
  return apiRequest<AdvertisementResponse>(`/${id}`);
};

// Create a new advertisement
export const createAdvertisement = async (
  data: CreateAdvertisementRequest
): Promise<CreateAdvertisementResponse> => {
  return apiRequest<CreateAdvertisementResponse>('', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Update an advertisement
export const updateAdvertisement = async (
  id: number,
  data: UpdateAdvertisementRequest
): Promise<UpdateAdvertisementResponse> => {
  return apiRequest<UpdateAdvertisementResponse>(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Delete an advertisement
export const deleteAdvertisement = async (id: number): Promise<DeleteAdvertisementResponse> => {
  return apiRequest<DeleteAdvertisementResponse>(`/${id}`, {
    method: 'DELETE',
  });
};

// Change advertisement status
export const changeAdvertisementStatus = async (
  id: number,
  data: ChangeStatusRequest
): Promise<ChangeStatusResponse> => {
  return apiRequest<ChangeStatusResponse>(`/${id}/status`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
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
