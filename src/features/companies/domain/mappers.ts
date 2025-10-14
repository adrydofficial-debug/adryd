// src/features/companies/domain/mappers.ts

import { Company, CompanyCategory, CompanyCategoryGroup } from './entities';

// Transform API response to domain entity
export const mapCompanyFromApi = (apiData: any): Company => {
  return {
    id: apiData.id,
    user_id: apiData.user_id,
    company_name: apiData.company_name,
    company_category_id: apiData.company_category_id,
    company_ntn: apiData.company_ntn,
    address: apiData.address,
    email: apiData.email,
    contact_number: apiData.contact_number,
    logo_url: apiData.logo_url,
    logo_filename: apiData.logo_filename,
    logo_size: apiData.logo_size,
    logo_type: apiData.logo_type,
    created_at: apiData.created_at,
    updated_at: apiData.updated_at,
    is_verified: apiData.is_verified,
    company_category_ref: apiData.company_category_ref ? mapCategoryFromApi(apiData.company_category_ref) : undefined,
  };
};

export const mapCategoryFromApi = (apiData: any): CompanyCategory => {
  return {
    id: apiData.id,
    name: apiData.name,
    group_id: apiData.group_id,
    created_at: apiData.created_at,
    updated_at: apiData.updated_at,
  };
};

export const mapCategoryGroupFromApi = (apiData: any): CompanyCategoryGroup => {
  return {
    id: apiData.id,
    name: apiData.name,
    categories: apiData.categories?.map(mapCategoryFromApi) || [],
    created_at: apiData.created_at,
    updated_at: apiData.updated_at,
  };
};

// Transform domain entity to API request
export const mapCompanyToApi = (company: Partial<Company>) => {
  return {
    company_name: company.company_name,
    company_category_id: company.company_category_id,
    company_ntn: company.company_ntn,
    address: company.address,
    email: company.email,
    contact_number: company.contact_number,
    logo_url: company.logo_url,
    logo_filename: company.logo_filename,
    logo_size: company.logo_size,
    logo_type: company.logo_type,
  };
};
