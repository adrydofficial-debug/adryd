// src/features/boards/domain/mappers.ts

import {
  BoardRatingsResponse,
  FavoritesResponse,
  FilteredBoardsResponse,
  FiltersResponse,
  RatingSummaryResponse,
} from '../api/types/responses';
import {
  Board,
  BoardCategoryGroup,
  Filters,
  PaginatedBoards,
  Rating,
  RatingSummary,
} from './entities';

// 🧭 Map FiltersResponse → Filters
export const mapFiltersResponse = (res: FiltersResponse): Filters => ({
  groups: (res.data.groups ?? []).map((group: BoardCategoryGroup) => ({
    id: group.id,
    name: group.name,
    categories: (group.categories ?? []).map(cat => ({
      id: cat.id,
      name: cat.name,
      boards: (cat.boards ?? []).map(mapBoard),
    })),
  })),
  recommended: (res.data.recommended ?? []).map(mapBoard),
  nearest: (res.data.nearest ?? []).map(mapBoard),
  seeAll: (res.data.seeAll ?? []).map(mapBoard),
});

// 🧭 Map FilteredBoardsResponse → PaginatedBoards
export const mapFilteredBoards = (
  res: FilteredBoardsResponse,
): PaginatedBoards => ({
  boards: (res.boards ?? []).map(mapBoard),
  page: res.page,
  totalPages: Math.ceil((res.total ?? 0) / (res.limit || 1)),
});

// 🧭 Map BoardRatingsResponse → Rating[]
export const mapBoardRatings = (res: BoardRatingsResponse): Rating[] =>
  (res.data ?? []).map(r => ({
    id: r.id,
    stars: r.rating ?? 0,
    comment: r.comment ?? '',
    createdAt: r.created_at,
    user: {
      id: r.user.id,
      name: r.user.full_name ?? 'Anonymous',
      avatar: r.user.avatar_url ?? null,
    },
  }));

// 🧭 Map RatingSummaryResponse → RatingSummary
export const mapRatingSummary = (
  res: RatingSummaryResponse,
): RatingSummary => ({
  average: res.average_rating ?? 0,
  total: res.total_ratings ?? 0,
  recent: (res.recent_ratings ?? []).map(r => ({
    id: r.id,
    stars: r.rating,
    comment: r.comment ?? '',
    createdAt: r.created_at,
    user: {
      id: r.user.id,
      name: r.user.full_name ?? 'Anonymous',
      avatar: r.user.avatar_url ?? null,
    },
  })),
  breakdown: {},
});

// 🧭 Map FavoritesResponse → Board[]
export const mapFavorites = (res: FavoritesResponse): Board[] =>
  (res.data ?? []).map(board => ({
    id: board.id,
    title: board.title,
    image: board.image_url || '',
    rating: 0, // Default rating since it's not in the API response
    totalRatings: 0, // Default since it's not in the API response
    price: 0, // Default price since it's not in the API response
    location: board.category?.name || 'Unknown Location',
    description: '', // Default description
    size: '12x8', // Default size
    currency: 'USD', // Default currency
  }));

// 🧭 Helper: map board object
export const mapBoard = (b: any): Board => ({
  id: b.id,
  title: b.name ?? b.title ?? 'Untitled',
  image: b.image_url ?? b.image ?? '',
  rating: b.avg_rating ?? b.rating ?? 0,
  totalRatings: b.total_ratings ?? 0,
  price: b.price ?? 0,
  location: b.location ?? '',
});
