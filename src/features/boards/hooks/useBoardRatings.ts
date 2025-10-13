import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchBoardRatings, fetchRatingSummary } from '../api/api';
import { Rating, RatingSummary } from '../domain/entities';
import { mapBoardRatings, mapRatingSummary } from '../domain/mappers';

export const useBoardRatings = (boardId: number, page = 1, limit = 10) =>
  useQuery<Rating[]>({
    queryKey: ['boardRatings', boardId, page],
    queryFn: async () => {
      const res = await fetchBoardRatings(boardId, page, limit);
      return mapBoardRatings(res);
    },
    enabled: !!boardId,
    placeholderData: keepPreviousData, // ✅ v5 syntax
  });

export const useRatingSummary = (boardId: number) =>
  useQuery<RatingSummary>({
    queryKey: ['ratingSummary', boardId],
    queryFn: async () => {
      const res = await fetchRatingSummary(boardId);
      return mapRatingSummary(res);
    },
    enabled: !!boardId,
  });
