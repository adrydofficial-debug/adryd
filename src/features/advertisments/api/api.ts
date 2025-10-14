import apiClient from '../../../services/apiClient'; // adjust path to your axios client
import {
  ChangeStatusRequest,
  CreateAdvertisementRequest,
  UpdateAdvertisementRequest,
  UploadUrlRequest,
} from './types/requests';
import {
  AdvertisementResponse,
  PaginatedAdvertisementsResponse,
} from './types/responses';

/* Advertisements API wrapper (frontend) */

export const advertisementsApi = {
  // list (paginated)
  getAdvertisements: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedAdvertisementsResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    const res = await apiClient.get(`/advertisements?${query.toString()}`);
    return res.data;
  },

  // single
  getAdvertisementById: async (id: number): Promise<AdvertisementResponse> => {
    const res = await apiClient.get(`/advertisements/${id}`);
    return res.data;
  },

  // create (can include bookings)
  createAdvertisement: async (
    payload: CreateAdvertisementRequest,
  ): Promise<AdvertisementResponse> => {
    const res = await apiClient.post('/advertisements', payload);
    return res.data;
  },

  // update (partial)
  updateAdvertisement: async (
    id: number,
    payload: UpdateAdvertisementRequest,
  ): Promise<AdvertisementResponse> => {
    const res = await apiClient.put(`/advertisements/${id}`, payload);
    return res.data;
  },

  // delete
  deleteAdvertisement: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/advertisements/${id}`);
    return res.data;
  },

  // change status
  changeStatus: async (id: number, payload: ChangeStatusRequest) => {
    const res = await apiClient.post(`/advertisements/${id}/status`, payload);
    return res.data;
  },

  // signed upload URL
  getUploadUrl: async (payload: UploadUrlRequest) => {
    const res = await apiClient.post(`/advertisements/upload-url`, payload);
    return res.data;
  },

  // signed download URL
  getDownloadUrl: async (key: string) => {
    const res = await apiClient.get(
      `/advertisements/download-url/${encodeURIComponent(key)}`,
    );
    return res.data;
  },
};
