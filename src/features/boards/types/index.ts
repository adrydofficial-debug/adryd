// Board Category Group Interface
export interface BoardCategoryGroup {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  categories: BoardCategory[];
}

// Board Category Interface
export interface BoardCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  group_id: number;
  created_at: Date;
  updated_at: Date;
  boards?: Board[];
}

// Board Interface
export interface Board {
  id: number;
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  price?: number;
  size?: string;
  category_id?: number;
  created_at: Date;
  updated_at: Date;
  category?: BoardCategory;
}

// Recommended Board Interface
export interface RecommendedBoard {
  id: number;
  board_id: number;
  created_at: Date;
  updated_at: Date;
  board: Board;
}

// Board Rating Interface
export interface BoardRating {
  id: number;
  user_id: number;
  board_id: number;
  rating: number;
  comment?: string;
  created_at: Date;
  updated_at: Date;
}

// Board Favorite Interface
export interface BoardFavorite {
  id: number;
  user_id: number;
  board_id: number;
  created_at: Date;
  updated_at: Date;
  board?: Board;
}

// Rating Summary Interface
export interface RatingSummary {
  average_rating: number;
  total_ratings: number;
}

// Query Parameters
export interface BoardQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface NearestBoardQueryParams extends BoardQueryParams {
  lat: number;
  lng: number;
}

// Rating Request
export interface CreateRatingRequest {
  user_id: number;
  rating: number;
  comment?: string;
}

// Favorite Response
export interface FavoriteResponse {
  message: string;
  is_favorite: boolean;
  favorite?: BoardFavorite;
}

// Board with Category
export interface BoardWithCategory extends Board {
  category: BoardCategory;
}

// Favorite Board Item
export interface FavoriteBoardItem {
  id: number;
  title: string;
  category: BoardCategory;
  image_url?: string;
  created_at: Date;
}
