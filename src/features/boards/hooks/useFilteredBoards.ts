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

  console.log(
    '[useFilteredBoards] normalizedParams:',
    JSON.stringify(normalizedParams, null, 2),
  );

  return useQuery<PaginatedBoards>({
    queryKey: ['filteredBoards', normalizedParams],
    queryFn: async () => {
      console.log(
        '[useFilteredBoards] queryFn started, params:',
        JSON.stringify(normalizedParams, null, 2),
      );

      try {
        const res = await fetchFilteredBoards(normalizedParams);

        console.log('[useFilteredBoards] API response raw:', res);

        const mapped = mapFilteredBoards(res);

        console.log('[useFilteredBoards] mapped result:', mapped);

        return mapped;
      } catch (error) {
        console.error(
          '[useFilteredBoards] fetch or mapping failed:',
          error,
          'params:',
          JSON.stringify(normalizedParams, null, 2),
        );
        throw error;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
    // onError: error => {
    //   console.error('[useFilteredBoards] query error:', error);
    // },
    // onSuccess: data => {
    //   console.log('[useFilteredBoards] query success, data:', data);
    // },
  });
};
