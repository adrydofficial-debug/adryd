// src/features/boards/api/types/requests.ts

import { Board, BoardCategoryGroup } from '../../domain/entities';

// 🎯 /api/boards/filters
export interface FiltersResponse {
  filters: FilterMeta[];
  data: {
    groups: BoardCategoryGroup[];
    recommended: Board[];
    nearest: Board[];
    seeAll: Board[];
  };
}

// 🧩 Simplified Filter metadata for UI tabs/dropdowns
export interface FilterMeta {
  name: string;
  slug: string;
}

// 🔍 /api/boards/filter
export interface FilteredBoardsResponse {
  data: Board[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ⭐ /api/boards/:id/rate
export interface RateBoardResponse {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

// 📖 /api/boards/:id/ratings
export interface BoardRatingsResponse {
  total: number;
  page: number;
  limit: number;
  data: Array<{
    id: number;
    rating: number;
    comment?: string;
    created_at: string;
    user: {
      id: string;
      full_name?: string | null;
      avatar_url?: string | null;
    };
  }>;
}

// 📊 /api/boards/:id/rating-summary
export interface RatingSummaryResponse {
  average_rating: number;
  total_ratings: number;
  recent_ratings: Array<{
    id: number;
    rating: number;
    comment?: string;
    created_at: string;
    user: {
      id: string;
      full_name?: string | null;
      avatar_url?: string | null;
    };
  }>;
}

// 💖 /api/boards/favorites
export interface FavoritesResponse {
  total: number;
  page: number;
  limit: number;
  data: Array<{
    id: number;
    title: string;
    category: {
      id: number;
      name: string;
      slug: string;
    };
    image_url?: string;
    created_at: string;
    avg_rating: number;
    total_ratings: number;
  }>;
}

// 🔍 /api/boards/:id/is-favorite
export interface IsFavoriteResponse {
  is_favorite: boolean;
}

// 💖 Toggle favorite response
export interface ToggleFavoriteResponse {
  message: string;
  is_favorite: boolean;
}
