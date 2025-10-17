import { useQuery } from '@tanstack/react-query';
import { fetchBoardFilters } from '../api/api';
import { Filters } from '../domain/entities';
import { mapFiltersResponse } from '../domain/mappers';

export const useBoardFilters = () =>
  useQuery<Filters>({
    queryKey: ['boardFilters'],
    queryFn: async () => {
      console.log('useBoardFilters - Fetching board filters data...');
      const res = await fetchBoardFilters();
      console.log('useBoardFilters - API response received:', {
        hasGroups: !!res.data?.groups,
        groupsCount: res.data?.groups?.length || 0,
        hasRecommended: !!res.data?.recommended,
        recommendedCount: res.data?.recommended?.length || 0,
        timestamp: new Date().toISOString()
      });
      return mapFiltersResponse(res);
    },
    staleTime: 0, // No cache - always fetch fresh data
  });
