// src/features/companies/api/types/responses.ts
import { CompanyCategory, UserProfile } from '../../domain/entities';

// 🏢 /api/companies
export interface CompanyResponse {
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
  company_category_ref?: CompanyCategory | null;
  user?: UserProfile | null;
}

// 🧩 /api/companies/categories/groups
export interface CompanyCategoryGroupsResponse {
  groups: Array<{
    id: number;
    name: string;
    description?: string | null;
    categories: Array<{
      id: number;
      name: string;
      group_id: number;
      _count?: { companies: number };
    }>;
  }>;
  categories: Array<{
    id: number;
    name: string;
    group_id: number;
    group_name: string;
    companies_count: number;
  }>;
}
