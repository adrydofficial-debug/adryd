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

// Advertisement List Response
export interface AdvertisementListResponse extends PaginatedResponse<AdvertisementWithRelations> {}

// Single Advertisement Response
export interface AdvertisementResponse extends ApiResponse<AdvertisementWithRelations> {}

// Create Advertisement Response
export interface CreateAdvertisementResponse extends ApiResponse<AdvertisementWithRelations> {
  data: AdvertisementWithRelations;
}

// Update Advertisement Response
export interface UpdateAdvertisementResponse extends ApiResponse<AdvertisementWithRelations> {
  data: AdvertisementWithRelations;
}

// Delete Advertisement Response
export interface DeleteAdvertisementResponse extends ApiResponse<{ message: string }> {
  data: { message: string };
}

// Change Status Response
export interface ChangeStatusResponse extends ApiResponse<Advertisement> {
  data: Advertisement;
}

// Error Response
export interface ErrorResponse extends ApiResponse<null> {
  success: false;
  error: string;
}

// Import Advertisement types
import { AdvertisementWithRelations, Advertisement } from './index';
