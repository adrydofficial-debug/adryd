// src/features/companies/api/api.ts

import apiClient from '../../../services/apiClient';
import {
  Company,
  CompanyCategory,
  CompanyCategoryGroup,
} from '../domain/entities';
import { mapCompany, mapCompanyCategoryGroups } from '../domain/mappers';
import {
  CompanyCategoryGroupsResponse,
  CompanyResponse,
} from './types/responses';

/* -------------------------------------------------------------------------- */
/* 🏢 COMPANIES API                                                          */
/* -------------------------------------------------------------------------- */

export const companiesApi = {
  /** Get all companies for the logged-in user */
  async getCompanies(): Promise<Company[]> {
    const response = await apiClient.get<CompanyResponse[]>('/api/companies');
    return response.data.map(mapCompany);
  },

  /** Get a single company by ID */
  async getCompanyById(id: number): Promise<Company> {
    const response = await apiClient.get<CompanyResponse>(
      `/api/companies/${id}`,
    );
    return mapCompany(response.data);
  },

  /** Create a new company */
  async createCompany(data: Partial<Company>): Promise<Company> {
    const response = await apiClient.post<CompanyResponse>(
      '/api/companies',
      data,
    );
    return mapCompany(response.data);
  },

  /** Update an existing company */
  async updateCompany(id: number, data: Partial<Company>): Promise<Company> {
    const response = await apiClient.put<CompanyResponse>(
      `/api/companies/${id}`,
      data,
    );
    return mapCompany(response.data);
  },

  /** Delete a company */
  async deleteCompany(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/api/companies/${id}`,
    );
    return response.data;
  },
};

/* -------------------------------------------------------------------------- */
/* 🧩 COMPANY CATEGORIES API                                                 */
/* -------------------------------------------------------------------------- */

export const companyCategoriesApi = {
  /** Get all company category groups (and flat categories list) */
  async getCategoryGroups(): Promise<{
    groups: CompanyCategoryGroup[];
    categories: CompanyCategory[];
  }> {
    const response = await apiClient.get<CompanyCategoryGroupsResponse>(
      '/api/companies/categories/groups',
    );
    return mapCompanyCategoryGroups(response.data);
  },
};

/* -------------------------------------------------------------------------- */
/* 🖼️ COMPANY LOGO API (OPTIONAL ENDPOINTS)                                  */
/* -------------------------------------------------------------------------- */

export const companyLogoApi = {
  /** Upload company logo */
  async uploadLogo(
    companyId: number,
    logoFile: FormData,
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/api/companies/${companyId}/logo`,
      logoFile,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data;
  },

  /** Delete company logo */
  async deleteLogo(companyId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/api/companies/${companyId}/logo`,
    );
    return response.data;
  },

  /** Build logo URL */
  getLogoUrl(companyId: number): string {
    return `${apiClient.defaults.baseURL}/api/companies/${companyId}/logo`;
  },
};

/* -------------------------------------------------------------------------- */
/* EXPORT SHORTCUTS FOR HOOKS                                                */
/* -------------------------------------------------------------------------- */

export const fetchCompanies = companiesApi.getCompanies;
export const fetchCompanyById = companiesApi.getCompanyById;
export const fetchCompanyCategoryGroups =
  companyCategoriesApi.getCategoryGroups;
