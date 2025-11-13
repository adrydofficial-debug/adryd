// src/features/location/api.ts
import apiClient from '../../../services/apiClient';
import { ApiResponse } from '../../boards/types/response';
import { City, Location } from '../domain/entities';

const BASE = '/api';

export const LocationApi = {
  getLocations: async (cityId?: number): Promise<ApiResponse<Location[]>> => {
    const params = cityId ? { city_id: cityId } : {};
    const { data } = await apiClient.get(`${BASE}/location/locations`, {
      params,
    });
    return data;
  },

  getCities: async (): Promise<ApiResponse<City[]>> => {
    console.log(
      '[getCities] → Fetching cities from:',
      `${BASE}/location/cities`,
    );
    try {
      const { data } = await apiClient.get(`${BASE}/location/cities`);
      console.log('[getCities] ✅ Response data:', data);
      return data;
    } catch (error: any) {
      console.error(
        '[getCities] ❌ Error fetching cities:',
        error?.response?.data || error.message,
      );
      throw error;
    }
  },

  getCityById: async (id: number): Promise<ApiResponse<City>> => {
    const { data } = await apiClient.get(`${BASE}/location/cities/${id}`);
    return data;
  },
};
