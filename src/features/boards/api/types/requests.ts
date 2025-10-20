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
  filter?: string; // recommended | nearest | category | group | favorites | see_all
  page?: number;
  limit?: number;
  search?: string;
  lat?: number;
  lng?: number;
  slug?: string; // unified slug for either category or group
  min_price?: number;
  max_price?: number;
  location?: string;
}
