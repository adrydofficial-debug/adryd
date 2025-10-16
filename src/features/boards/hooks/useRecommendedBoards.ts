import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchBoardFilters } from '../api/api';
import { Board } from '../domain/entities';
import { mapFiltersResponse } from '../domain/mappers';

interface UseRecommendedBoardsParams {
  limit?: number;
}

export const useRecommendedBoards = (params?: UseRecommendedBoardsParams) =>
  useInfiniteQuery<{ data: Board[]; nextPage?: number }>({
    queryKey: ['recommendedBoards', params?.limit],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetchBoardFilters();
      const mapped = mapFiltersResponse(res);
      return {
        data: mapped.recommended,
        nextPage: undefined, // This API doesn't support pagination for recommended
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5, // cache for 5 mins
  });
