// src/features/companies/types/requests.ts

export interface CreateCompanyRequest {
  company_name: string;
  business_category_id: number;
  company_ntn: string;
  address: string;
  email: string;
  contact_number: string;
  logo?: string; // Base64 encoded image or file path
}

export interface UpdateCompanyRequest {
  company_name?: string;
  business_category_id?: number;
  company_ntn?: string;
  address?: string;
  email?: string;
  contact_number?: string;
  logo?: string;
}

export interface GetCompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
  business_category_id?: number;
  group_id?: number;
  is_verified?: boolean;
}

export interface GetCompanyGroupsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetCompanyCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  group_id?: number;
}
