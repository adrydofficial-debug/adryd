import { useQuery } from '@tanstack/react-query';
import { fetchBoardFilters } from '../api/api';
import { Filters } from '../domain/entities';
import { mapFiltersResponse } from '../domain/mappers';

export const useBoardFilters = () =>
  useQuery<Filters>({
    queryKey: ['boardFilters'],
    queryFn: async () => {
      const res = await fetchBoardFilters();
      return mapFiltersResponse(res);
    },
    // Cache and refetch behavior tuned to reduce repeated calls
    staleTime: 1000 * 60 * 5, // 5 minutes: data considered fresh; no refetch within this window
    gcTime: 1000 * 60 * 30, // 30 minutes: keep cache in memory
    refetchOnMount: false, // do not refetch when component remounts if data is in cache
    refetchOnWindowFocus: false, // do not refetch on app focus
    refetchOnReconnect: false, // do not refetch when network reconnects
  });
