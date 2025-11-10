// src/features/boards/api/types/requests.ts

// ⭐ Rate a board
export interface RateBoardRequest {
  user_id: string;
  rating: number;
  comment?: string;
}

// 💖 Toggle favorite
export interface ToggleFavoriteRequest {
  board_id: number;
}

// 🔍 Filtered boards (query)
export interface FilterBoardsParams {
  // Can now be a single string or an array of slugs
  slug?: string | string[];

  // Kept for backward compatibility; frontend can use either
  filter?: string;

  // Can now be a single location ID or multiple
  location_id?: number | number[];

  // Optional city filter (only one city at a time)
  city_id?: number;

  // Search and pricing
  search?: string;
  min_price?: number;
  max_price?: number;

  // Geolocation (for nearest)
  lat?: number;
  lng?: number;

  // Pagination
  page?: number;
  limit?: number;
}
