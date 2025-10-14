// src/features/companies/domain/entities.ts
export interface Company {
  id: number;
  company_name: string;
  company_ntn?: string | null;
  address?: string | null;
  email?: string | null;
  contact_number?: string | null;
  logo_url?: string | null;
  logo_filename?: string | null;
  logo_size?: number | null;
  logo_type?: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  category?: CompanyCategory | null;
  user?: UserProfile | null;
}

export interface CompanyCategory {
  id: number;
  name: string;
  group?: CompanyCategoryGroup | null;
  companiesCount?: number;
}

export interface CompanyCategoryGroup {
  id: number;
  name: string;
  description?: string | null;
  categories: CompanyCategory[];
}

export interface UserProfile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

export interface PaginatedCompanies {
  data: Company[];
  total: number;
  page: number;
  totalPages: number;
}
