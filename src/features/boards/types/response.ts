// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Paginated Response
export interface PaginatedResponse<T = any> {
  total: number;
  page: number;
  limit: number;
  data: T[];
}

// Board List Response
export interface BoardListResponse extends PaginatedResponse<Board> {}

// Recommended Board List Response
export interface RecommendedBoardListResponse extends PaginatedResponse<RecommendedBoard> {}

// Nearest Board List Response
export interface NearestBoardListResponse {
  page: number;
  limit: number;
  data: Board[];
}

// Board Category Response
export interface BoardCategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  group_id: number;
  created_at: Date;
  updated_at: Date;
  boards: Board[];
}

// Board Groups Response
export interface BoardGroupsResponse extends Array<BoardCategoryGroup> {}

// Board Rating List Response
export interface BoardRatingListResponse extends PaginatedResponse<BoardRating> {}

// Rating Summary Response
export interface RatingSummaryResponse {
  average_rating: number;
  total_ratings: number;
}

// Favorite List Response
export interface FavoriteListResponse extends PaginatedResponse<FavoriteBoardItem> {}

// Is Favorite Response
export interface IsFavoriteResponse {
  is_favorite: boolean;
}

// Create Rating Response
export interface CreateRatingResponse extends ApiResponse<BoardRating> {
  data: BoardRating;
}

// Toggle Favorite Response
export interface ToggleFavoriteResponse extends ApiResponse<FavoriteResponse> {
  data: FavoriteResponse;
}

// Error Response
export interface ErrorResponse extends ApiResponse<null> {
  success: false;
  error: string;
}

// Import Board types
import { 
  Board, 
  RecommendedBoard, 
  BoardCategoryGroup, 
  BoardCategory, 
  BoardRating, 
  FavoriteBoardItem 
} from './index';
