import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { fetchFavorites, isFavorite, toggleFavorite } from '../api/api';
import { Board } from '../domain/entities';
import { mapFavorites } from '../domain/mappers';
import {
  FavoritesResponse,
  IsFavoriteResponse,
  ToggleFavoriteResponse,
} from '../api/types/responses';

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

export const useFavoriteStatus = (boardId?: number) => {
  return useQuery<IsFavoriteResponse>({
    queryKey: ['is-favorite', boardId],
    queryFn: async () => {
      if (!boardId || Number.isNaN(boardId)) {
        throw new Error('Board id is required to check favorite status.');
      }
      return isFavorite(boardId);
    },
    enabled: typeof boardId === 'number' && boardId > 0,
    staleTime: 0,
  });
};

export const useToggleFavorite = (boardId?: number) => {
  const queryClient = useQueryClient();

  return useMutation<ToggleFavoriteResponse>({
    mutationFn: () => {
      if (!boardId || Number.isNaN(boardId)) {
        throw new Error('Board id is required to toggle favorite.');
      }
      return toggleFavorite(boardId);
    },
    onSuccess: data => {
      if (boardId) {
        queryClient.setQueryData(['is-favorite', boardId], data);
      }
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites-boards'] });
      queryClient.invalidateQueries({ queryKey: ['boardFilters'] });
      queryClient.invalidateQueries({ queryKey: ['filteredBoards'] });
    },
  });
};
