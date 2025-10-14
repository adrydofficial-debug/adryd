// Base API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Company list response
export interface CompanyListResponse extends PaginatedResponse<Company> {}

// Company category list response
export interface CompanyCategoryListResponse extends ApiResponse<CompanyCategory[]> {}

// Company category group list response
export interface CompanyCategoryGroupListResponse extends ApiResponse<CompanyCategoryGroup[]> {}

// Company stats response
export interface CompanyStatsResponse extends ApiResponse<CompanyStats> {}

// Company export response
export interface CompanyExportResponse extends ApiResponse<CompanyExportData> {}

// Company import response
export interface CompanyImportResponse extends ApiResponse<CompanyImportResult> {}

// Company validation responses
export interface CompanyValidationResponse extends ApiResponse<{ isUnique: boolean }> {}

// Company logo upload response
export interface CompanyLogoUploadResponse extends ApiResponse<{ logo_url: string }> {}

// Company logo delete response
export interface CompanyLogoDeleteResponse extends ApiResponse<{ message: string }> {}

// Import types from main index
import { 
  Company, 
  CompanyCategory, 
  CompanyCategoryGroup, 
  CompanyStats, 
  CompanyExportData, 
  CompanyImportResult 
} from './index';
