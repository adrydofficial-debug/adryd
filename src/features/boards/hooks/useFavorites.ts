import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { fetchFavorites, toggleFavorite } from '../api/api';
import { Board } from '../domain/entities';
import { mapFavorites } from '../domain/mappers';
import { FavoritesResponse } from '../api/types/responses';

export const useFavorites = (page = 1, limit = 10) =>
  useQuery<FavoritesResponse>({
    queryKey: ['favorites', page, limit],
    queryFn: async () => {
      const res = await fetchFavorites(page, limit);
      return res;
    },
    placeholderData: keepPreviousData,
    staleTime: 0, // Always fetch fresh data
  });

export const useFavoritesBoards = (page = 1, limit = 10) =>
  useQuery<Board[]>({
    queryKey: ['favorites-boards', page, limit],
    queryFn: async () => {
      const res = await fetchFavorites(page, limit);
      return mapFavorites(res);
    },
    placeholderData: keepPreviousData,
    staleTime: 0, // Always fetch fresh data
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
