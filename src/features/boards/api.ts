import apiClient from '../../services/apiClient';
import {Board} from './types/Board';
import {BoardGroup} from './types/BoardGroup';

export interface Meta {
  page?: number;
  offset?: number;
  limit?: number;
  has_more: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: Meta;
}

// 🔹 Get all boards (paginated)
export const fetchBoards = (params: Record<string, any> = {}) =>
  apiClient
    .get<PaginatedResponse<Board>>('/boards', {params})
    .then(res => res.data);

// 🔹 Get boards by group
export const fetchBoardsByGroup = (
  groupId: string,
  params: Record<string, any> = {},
) =>
  apiClient
    .get<PaginatedResponse<Board>>(`/board-categories/${groupId}/boards`, {
      params,
    })
    .then(res => res.data);

// 🔹 Get all groups with categories and boards
export const fetchGroups = (params: Record<string, any> = {}) =>
  apiClient
    .get<{data: BoardGroup[]}>('/board-category-group', {params})
    .then(res => res.data);

// 🔹 Recommended boards
export const fetchRecommendedBoards = (params: Record<string, any> = {}) =>
  apiClient
    .get<PaginatedResponse<Board>>('/boards/recommended', {params})
    .then(res => res.data);

// 🔹 Nearest boards
export const fetchNearestBoards = (params: Record<string, any>) =>
  apiClient
    .get<PaginatedResponse<Board>>('/boards/nearest', {params})
    .then(res => res.data);

// 🔹 Boards by category
export const fetchBoardsByCategory = (
  categoryId: string,
  params: Record<string, any> = {},
) =>
  apiClient
    .get<PaginatedResponse<Board>>(`/board-categories/${categoryId}/boards`, {
      params,
    })
    .then(res => res.data);
