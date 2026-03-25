// src/features/location/hooks.ts
import { useQuery } from '@tanstack/react-query';
import { LocationApi } from '../api/api';
import { City, Location } from '../domain/entities';
import { mapCity, mapLocation } from '../domain/mappers';

export const useLocations = (cityId?: number) => {
  return useQuery<Location[], Error>({
    queryKey: ['locations', cityId],
    queryFn: async () => {
      const res = await LocationApi.getLocations(cityId);
      return res.data!.map(mapLocation);
    },
    enabled: !!cityId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCities = () => {
  return useQuery<City[], Error>({
    queryKey: ['cities'],
    queryFn: async () => {
      console.log('[useCities] Fetching cities...');
      const res = await LocationApi.getCities();
      console.log('[useCities] Response:', res);
      if (!res.data) {
        console.error('[useCities] No data in response');
        return [];
      }
      const mapped = res.data.map(mapCity);
      console.log('[useCities] Mapped cities:', mapped);
      return mapped;
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useCityById = (id: number) => {
  return useQuery<City, Error>({
    queryKey: ['city', id],
    queryFn: async () => {
      const res = await LocationApi.getCityById(id);
      return mapCity(res.data);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};
