import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rateBoard } from '../api/api';
import { RateBoardRequest } from '../api/types/requests';

export const useRateBoard = (boardId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RateBoardRequest) => rateBoard(boardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardRatings', boardId] });
      queryClient.invalidateQueries({ queryKey: ['ratingSummary', boardId] });
      queryClient.invalidateQueries({ queryKey: ['boardFilters'] });
      queryClient.invalidateQueries({ queryKey: ['filteredBoards'] });
    },
  });
};
