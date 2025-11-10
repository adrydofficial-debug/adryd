import { useQuery } from '@tanstack/react-query';
import { fetchBoardUnavailableTimes } from '../api/api';
import { UnavailableTimesResponse } from '../api/types/responses';

export const useBoardUnavailableTimes = (boardId: number) => {
  return useQuery<UnavailableTimesResponse, Error>({
    queryKey: ['boardUnavailableTimes', boardId],
    queryFn: async () => {
      const res = await fetchBoardUnavailableTimes(boardId);
      return res;
    },
    enabled: !!boardId, // Only run when boardId is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

