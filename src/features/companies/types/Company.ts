// src/features/companies/types/Company.ts

export interface BusinessCategoryGroup {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessCategory {
  id: number;
  name: string;
  group_id: number;
  created_at: string;
  updated_at: string;
  group: BusinessCategoryGroup;
}

export interface CompanyUser {
  id: number;
  username: string;
  company_name: string;
  phone_number: string;
}

export interface Company {
  id: number;
  user_id: number;
  company_name: string;
  business_category: BusinessCategory | null;
  business_category_id: number;
  company_ntn: string;
  address: string;
  email: string;
  contact_number: string;
  logo_url: string | null;
  logo_filename: string | null;
  logo_size: number | null;
  logo_type: string | null;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  user: CompanyUser;
  business_category_ref: BusinessCategory;
}

export interface CompanyGroup {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  categories?: BusinessCategory[];
}

export interface CompanyCategory {
  id: number;
  name: string;
  group_id: number;
  created_at: string;
  updated_at: string;
  group: BusinessCategoryGroup;
}

export interface CompanyGroupWithCategories {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  categories: CompanyCategory[];
}
