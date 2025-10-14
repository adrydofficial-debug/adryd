// src/features/companies/domain/entities.ts

export interface Company {
  id: number;
  user_id: string;
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
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  company_category_ref?: CompanyCategory;
}

export interface CompanyCategory {
  id: number;
  name: string;
  group_id: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyCategoryGroup {
  id: number;
  name: string;
  categories: CompanyCategory[];
  created_at: string;
  updated_at: string;
}

export interface CompanyStats {
  total_companies: number;
  verified_companies: number;
  categories_count: number;
  recent_companies: Company[];
}

export interface CompanySearchFilters {
  search?: string;
  category_id?: number;
  group_id?: number;
  has_logo?: boolean;
  created_after?: string;
  created_before?: string;
}

export interface CompanyExportData {
  companies: Company[];
  export_date: string;
  total_count: number;
}

export interface CompanyImportResult {
  success_count: number;
  error_count: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}
