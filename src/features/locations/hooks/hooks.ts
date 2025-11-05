// src/features/location/hooks.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
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
    staleTime: 5000,
    placeholderData: keepPreviousData,
  });
};

export const useCities = () => {
  return useQuery<City[], Error>({
    queryKey: ['cities'],
    queryFn: async () => {
      console.log('Fetched cities:');
      const res = await LocationApi.getCities();
      console.log('Fetched cities:', res.data);
      const mapped = res.data!.map(mapCity);
      console.log('Mapped cities:', mapped);
      return mapped;
    },
    staleTime: 5000,
    placeholderData: keepPreviousData,
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
    staleTime: 5000,
  });
};
