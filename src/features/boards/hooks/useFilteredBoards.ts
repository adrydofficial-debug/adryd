//src/features/boards/hooks/useFilteredBoards.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchFilteredBoards } from '../api/api';
import { FilterBoardsParams } from '../api/types/requests';
import { PaginatedBoards } from '../domain/entities';
import { mapFilteredBoards } from '../domain/mappers';

export const useFilteredBoards = (params: FilterBoardsParams) =>
  useQuery<PaginatedBoards>({
    queryKey: ['filteredBoards', params],
    queryFn: async () => {
      const res = await fetchFilteredBoards(params);
      return mapFilteredBoards(res);
    },
    placeholderData: keepPreviousData, // ✅ v5 replacement
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
