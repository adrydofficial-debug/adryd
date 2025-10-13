import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  fetchBoards,
  fetchBoardsByCategory,
  fetchGroups,
  fetchNearestBoards,
  fetchRecommendedBoards,
  PaginatedResponse,
} from './api/api';
import { Board } from './types/Board';
import { BoardGroup } from './types/BoardGroup';

interface Filters {
  pageSize?: number;
  offset?: number;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

// ✅ All Boards (page-based)
export const useBoards = (filters: Filters = {}) =>
  useInfiniteQuery<PaginatedResponse<Board>, Error>({
    queryKey: ['boards', filters],
    queryFn: async ({ pageParam = 1 }) =>
      fetchBoards({
        ...filters,
        page: pageParam,
        pageSize: filters.pageSize || 10,
      }),
    getNextPageParam: lastPage =>
      lastPage?.meta?.has_more ? (lastPage.meta.page || 1) + 1 : undefined,
    initialPageParam: 1, // 🔹 REQUIRED
  });

// ✅ Groups
export const useGroups = (params: Filters = {}) =>
  useQuery<BoardGroup[], Error>({
    queryKey: ['groups', params],
    queryFn: async () => {
      const res = await fetchGroups(params);
      return res.data || [];
    },
  });

// ✅ Recommended Boards (offset-based)
export const useRecommendedBoards = (filters: Filters = {}) =>
  useInfiniteQuery<PaginatedResponse<Board>, Error>({
    queryKey: ['recommendedBoards', filters],
    queryFn: async ({ pageParam = 0 }) =>
      fetchRecommendedBoards({ ...filters, offset: pageParam }),
    getNextPageParam: lastPage =>
      lastPage?.meta?.has_more
        ? lastPage.meta.offset! + lastPage.meta.limit!
        : undefined,
    initialPageParam: 0, // 🔹 REQUIRED
  });

// ✅ Nearest Boards (offset-based)
export const useNearestBoards = (filters: Filters = {}) =>
  useInfiniteQuery<PaginatedResponse<Board>, Error>({
    queryKey: ['nearestBoards', filters],
    queryFn: async ({ pageParam = 0 }) =>
      fetchNearestBoards({ ...filters, offset: pageParam }),
    getNextPageParam: lastPage =>
      lastPage?.meta?.has_more
        ? lastPage.meta.offset! + lastPage.meta.limit!
        : undefined,
    enabled: !!filters.latitude && !!filters.longitude,
    initialPageParam: 0, // 🔹 REQUIRED
  });

// ✅ Boards by Category (offset-based)
export const useBoardsByCategory = (
  categoryId: string | null,
  filters: Filters = {},
) =>
  useInfiniteQuery<PaginatedResponse<Board>, Error>({
    queryKey: ['boardsByCategory', categoryId, filters],
    queryFn: async ({ pageParam = 0 }) =>
      fetchBoardsByCategory(categoryId!, { ...filters, offset: pageParam }),
    getNextPageParam: lastPage =>
      lastPage?.meta?.has_more
        ? lastPage.meta.offset! + lastPage.meta.limit!
        : undefined,
    enabled: !!categoryId,
    initialPageParam: 0, // 🔹 REQUIRED
  });
