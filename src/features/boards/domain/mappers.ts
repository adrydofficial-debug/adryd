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
export const mapFiltersResponse = (res: FiltersResponse): Filters => {
  const groups = (res.data.groups ?? []).map((group: BoardCategoryGroup) => ({
    id: group.id,
    name: group.name,
    slug: group.slug,
    categories: (group.categories ?? []).map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      boards: (cat.boards ?? []).map(mapBoard),
    })),
  }));

  const filters = (res.filters ?? []).map(f => {
    let matchedGroupSlug: string | undefined;

    for (const group of res.data.groups ?? []) {
      const groupSlug = group.slug;
      const matchedCategory = group.categories?.find(c => c.slug === f.slug);

      if (matchedCategory) {
        matchedGroupSlug = groupSlug;
        break;
      }

      if (groupSlug === f.slug) {
        matchedGroupSlug = groupSlug;
        break;
      }
    }

    return {
      name: f.name,
      slug: f.slug,
      groupSlug: matchedGroupSlug,
    };
  });

  return {
    groups,
    recommended: (res.data.recommended ?? []).map(mapBoard),
    nearest: (res.data.nearest ?? []).map(mapBoard),
    seeAll: (res.data.seeAll ?? []).map(mapBoard),
    filters,
  };
};

// 🧭 Map FilteredBoardsResponse → PaginatedBoards
export const mapFilteredBoards = (
  res: FilteredBoardsResponse,
): PaginatedBoards => ({
  boards: (res.data ?? []).map(mapBoard),
  page: res.pagination?.page ?? 1,
  totalPages: res.pagination?.totalPages ?? 1,
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
export const mapBoard = (b: any): any => ({
  id: b.id,
  title: b.title ?? b.name ?? 'Untitled Board',
  description: b.description ?? '',
  price:
    typeof b.price === 'string'
      ? parseFloat(b.price)
      : typeof b.price === 'number'
      ? b.price
      : 0,
  currency: b.currency ?? 'PKR',
  width: typeof b.width === 'number' ? b.width : null,
  height: typeof b.height === 'number' ? b.height : null,
  latitude: typeof b.latitude === 'number' ? b.latitude : null,
  longitude: typeof b.longitude === 'number' ? b.longitude : null,
  status: b.status ?? 'available',
  slug: b.slug ?? String(b.id ?? ''),
  category: b.category ?? null,
  owner: b.owner ?? null,
  location:
    typeof b.location === 'string' ? b.location : b.location?.name ?? '',
  media: Array.isArray(b.media) ? b.media : [],
  avg_rating: b.avg_rating ?? b.avgRating ?? 0,
  total_ratings: b.total_ratings ?? b.totalRatings ?? 0,
  metadata: b.metadata ?? null,
  created_at: b.created_at ?? b.createdAt ?? null,
  updated_at: b.updated_at ?? b.updatedAt ?? null,
  image_url:
    b.image_url ??
    (Array.isArray(b.media) && b.media.length > 0 ? b.media[0].url : null),
});
