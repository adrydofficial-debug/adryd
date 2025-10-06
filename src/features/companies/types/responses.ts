// src/features/companies/types/responses.ts

import {Company, CompanyGroup, CompanyCategory, CompanyGroupWithCategories} from './Company';

export interface CreateCompanyResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Company;
}

export interface UpdateCompanyResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Company;
}

export interface GetCompaniesResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    companies: Company[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

export interface GetCompanyGroupsResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    groups: CompanyGroup[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

export interface GetCompanyCategoriesResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    categories: CompanyCategory[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

export interface GetCompanyResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Company;
}

export interface DeleteCompanyResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface GetBusinessCategoriesWithGroupsResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: CompanyGroupWithCategories[];
}
