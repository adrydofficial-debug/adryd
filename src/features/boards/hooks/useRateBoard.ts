import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rateBoard } from '../api/api';
import { RateBoardRequest } from '../api/types/requests';

export const useRateBoard = (boardId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RateBoardRequest) => rateBoard(boardId, payload),
    onSuccess: async () => {
      console.log('Rating API success - invalidating all board-related queries');
      
      try {
        // Invalidate all board-related queries
        console.log('Invalidating boardRatings query...');
        await queryClient.invalidateQueries({ queryKey: ['boardRatings', boardId] });
        
        console.log('Invalidating ratingSummary query...');
        await queryClient.invalidateQueries({ queryKey: ['ratingSummary', boardId] });
        
        console.log('Invalidating boardFilters query...');
        await queryClient.invalidateQueries({ queryKey: ['boardFilters'] });
        
        console.log('Invalidating filteredBoards query...');
        await queryClient.invalidateQueries({ queryKey: ['filteredBoards'] });
        
        console.log('Invalidating favorites queries...');
        await queryClient.invalidateQueries({ queryKey: ['favorites'] });
        await queryClient.invalidateQueries({ queryKey: ['favorites-boards'] });
        
        // Force immediate refetch of critical queries
        console.log('Refetching boardFilters query...');
        await queryClient.refetchQueries({ queryKey: ['boardFilters'] });
        
        console.log('Refetching filteredBoards query...');
        await queryClient.refetchQueries({ queryKey: ['filteredBoards'] });
        
        console.log('Refetching favorites queries...');
        await queryClient.refetchQueries({ queryKey: ['favorites'] });
        await queryClient.refetchQueries({ queryKey: ['favorites-boards'] });
        
        console.log('All board queries invalidated and refetched successfully');
      } catch (error) {
        console.error('Error during query invalidation/refetch:', error);
      }
    },
  });
};
