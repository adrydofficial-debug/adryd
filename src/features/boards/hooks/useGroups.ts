import { useQuery } from '@tanstack/react-query';
import { fetchBoardFilters } from '../api/api';
import { BoardCategoryGroup } from '../domain/entities';
import { mapFiltersResponse } from '../domain/mappers';

interface UseGroupsParams {
  boardLimit?: number;
}

export const useGroups = (params?: UseGroupsParams) =>
  useQuery<BoardCategoryGroup[]>({
    queryKey: ['boardGroups', params?.boardLimit],
    queryFn: async () => {
      const res = await fetchBoardFilters();
      const mapped = mapFiltersResponse(res);
      return mapped.groups;
    },
    staleTime: 1000 * 60 * 5, // cache for 5 mins
  });
