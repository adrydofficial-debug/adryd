import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { fetchFavorites, toggleFavorite } from '../api/api';
import { Board } from '../domain/entities';
import { mapFavorites } from '../domain/mappers';

export const useFavorites = (page = 1, limit = 10) =>
  useQuery<Board[]>({
    queryKey: ['favorites', page],
    queryFn: async () => {
      const res = await fetchFavorites(page, limit);
      return mapFavorites(res);
    },
    placeholderData: keepPreviousData, // ✅ replacement for keepPreviousData
  });

export const useToggleFavorite = (boardId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => toggleFavorite(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['boardFilters'] });
      queryClient.invalidateQueries({ queryKey: ['filteredBoards'] });
    },
  });
};
