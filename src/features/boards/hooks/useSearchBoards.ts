import { useQuery } from '@tanstack/react-query';
import { fetchFilteredBoards } from '../api/api';
import { FilterBoardsParams } from '../api/types/requests';
import { PaginatedBoards } from '../domain/entities';
import { mapFilteredBoards } from '../domain/mappers';

// -----------------------------
// Search Boards Hook
// -----------------------------
export const useSearchBoards = (params: {
  slug: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
}) => {
  return useQuery<PaginatedBoards>({
    queryKey: ['searchBoards', params],
    queryFn: async () => {
      const searchParams: FilterBoardsParams = {
        slug: params.slug,
        search: params.search,
        min_price: params.min_price,
        max_price: params.max_price,
        page: params.page || 1,
        limit: params.limit || 10,
      };
      
      console.log('🔍 useSearchBoards - Searching boards with params:', searchParams);
      const res = await fetchFilteredBoards(searchParams);
      console.log('🔍 useSearchBoards - Raw API response:', res);
      const mappedData = mapFilteredBoards(res);
      console.log('🔍 useSearchBoards - Mapped data:', mappedData);
      return mappedData;
    },
    enabled: !!params.slug, // Only run when slug is provided
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
