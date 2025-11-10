import { useQuery } from '@tanstack/react-query';
import { fetchBoardFilters } from '../api/api';
import { Filters } from '../domain/entities';
import { mapFiltersResponse } from '../domain/mappers';

export const useBoardFilters = (cityId?: number) => {
  return useQuery<Filters>({
    queryKey: ['boardFilters', cityId],
    queryFn: async () => {
      const res = await fetchBoardFilters(cityId);
      return mapFiltersResponse(res);
    },
    // remove the condition so it always runs
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
