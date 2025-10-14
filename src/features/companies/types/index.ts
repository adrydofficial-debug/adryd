// Company Category Group Interface
export interface CompanyCategoryGroup {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  categories: CompanyCategory[];
}

// Company Category Interface
export interface CompanyCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  group_id: number;
  created_at: Date;
  updated_at: Date;
  companies?: Company[];
}

// Company Interface
export interface Company {
  id: number;
  company_name: string;
  company_category_id: number;
  company_ntn: string;
  address: string;
  email: string;
  contact_number: string;
  logo_url?: string;
  logo_filename?: string;
  logo_size?: number;
  logo_type?: string;
  created_at: Date;
  updated_at: Date;
  category?: CompanyCategory;
}

// Company Search Filters
export interface CompanySearchFilters {
  search?: string;
  category_id?: number;
  group_id?: number;
  location?: string;
  has_logo?: boolean;
}

// Company Stats Interface
export interface CompanyStats {
  total_companies: number;
  companies_with_logo: number;
  companies_by_category: Array<{
    category_id: number;
    category_name: string;
    count: number;
  }>;
  recent_companies: number;
}

// Company Export Data
export interface CompanyExportData {
  companies: Company[];
  export_date: Date;
  total_count: number;
}

// Company Import Result
export interface CompanyImportResult {
  success_count: number;
  error_count: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

// Query Parameters
export interface CompanyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  group_id?: number;
}

// Create Company Request
export interface CreateCompanyRequest {
  company_name: string;
  company_category_id: number;
  company_ntn: string;
  address: string;
  email: string;
  contact_number: string;
  logo_url?: string;
  logo_filename?: string;
  logo_size?: number;
  logo_type?: string;
}

// Update Company Request
export interface UpdateCompanyRequest {
  company_name?: string;
  company_category_id?: number;
  company_ntn?: string;
  address?: string;
  email?: string;
  contact_number?: string;
  logo_url?: string;
  logo_filename?: string;
  logo_size?: number;
  logo_type?: string;
}

// Company with Category
export interface CompanyWithCategory extends Company {
  category: CompanyCategory;
}
