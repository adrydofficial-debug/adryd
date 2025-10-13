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
    staleTime: 1000 * 60 * 5, // cache for 5 mins
  });
