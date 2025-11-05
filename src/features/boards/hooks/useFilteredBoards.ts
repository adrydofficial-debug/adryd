// src/features/boards/hooks/useFilteredBoards.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchFilteredBoards } from '../api/api';
import { FilterBoardsParams } from '../api/types/requests';
import { PaginatedBoards } from '../domain/entities';
import { mapFilteredBoards } from '../domain/mappers';

export const useFilteredBoards = (params: FilterBoardsParams) => {
  // Normalize single values to arrays if necessary
  const normalizedParams: FilterBoardsParams = {
    ...params,
    slug: params.slug
      ? Array.isArray(params.slug)
        ? params.slug
        : [params.slug]
      : undefined,
    location_id: params.location_id
      ? Array.isArray(params.location_id)
        ? params.location_id
        : [params.location_id]
      : undefined,
  };

  console.log('[useFilteredBoards] normalizedParams:', normalizedParams);

  return useQuery<PaginatedBoards>({
    queryKey: ['filteredBoards', normalizedParams],
    queryFn: async () => {
      console.log(
        '[useFilteredBoards] fetching boards with params:',
        normalizedParams,
      );
      try {
        const res = await fetchFilteredBoards(normalizedParams);
        console.log('[useFilteredBoards] raw response:', res);

        const mapped = mapFilteredBoards(res);
        console.log('[useFilteredBoards] mapped result:', mapped);

        return mapped;
      } catch (error) {
        console.error('[useFilteredBoards] fetch or mapping failed:', error);
        throw error;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
