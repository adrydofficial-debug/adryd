// src/features/companies/api/types/responses.ts
import { CompanyCategory, UserProfile } from '../../domain/entities';

/** 🏢 Represents a single company record */
export interface CompanyResponse {
  id: number;
  user_id?: string;
  company_name: string;
  company_category_id?: number;
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

/** 🧾 Upload info returned along with company creation */
export interface CompanyUploadInfo {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

/** 🎁 New combined response from POST /api/companies */
export interface CreateCompanyResponse {
  company: CompanyResponse;
  upload: CompanyUploadInfo;
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
