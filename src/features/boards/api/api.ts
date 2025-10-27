// src/features/boards/api/api.ts

import apiClient from '../../../services/apiClient';
import { FilterBoardsParams, RateBoardRequest } from './types/requests';
import {
  BoardRatingsResponse,
  FavoritesResponse,
  FilteredBoardsResponse,
  FiltersResponse,
  RateBoardResponse,
  RatingSummaryResponse,
} from './types/responses';

// 🎯 Get all filters (groups, recommended, nearest, see all)
export const fetchBoardFilters = () =>
  apiClient.get<FiltersResponse>('/api/boards/filters').then(res => res.data);

// 🔍 Get filtered boards (paginated)
export const fetchFilteredBoards = (params: FilterBoardsParams) =>
  apiClient
    .post<FilteredBoardsResponse>('api/boards/filter', params) // <-- changed from .get to .post
    .then(res => res.data);

// ⭐ Rate a board
export const rateBoard = (boardId: number, payload: RateBoardRequest) =>
  apiClient
    .post<RateBoardResponse>(`/api/boards/${boardId}/rate`, payload)
    .then(res => res.data);

// 📖 Get all ratings for a board
export const fetchBoardRatings = (boardId: number, page = 1, limit = 10) =>
  apiClient
    .get<BoardRatingsResponse>(`/api/boards/${boardId}/ratings`, {
      params: { page, limit },
    })
    .then(res => res.data);

// 📊 Get rating summary
export const fetchRatingSummary = (boardId: number) =>
  apiClient
    .get<RatingSummaryResponse>(`/api/boards/${boardId}/rating-summary`)
    .then(res => res.data);

// 💖 Toggle favorite
export const toggleFavorite = (boardId: number) =>
  apiClient.post(`/api/boards/${boardId}/favorite`).then(res => res.data);

// 💖 Get favorites
export const fetchFavorites = (page = 1, limit = 10) =>
  apiClient
    .get<FavoritesResponse>('/api/boards/favorites', {
      params: { page, limit },
    })
    .then(res => res.data);

// 🔍 Check if board is favorite
export const isFavorite = (boardId: number) =>
  apiClient
    .get<{ is_favorite: boolean }>(`/api/boards/${boardId}/is-favorite`)
    .then(res => res.data);
