// src/features/companies/api.ts

import apiClient from '../../services/apiClient';
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
  GetCompaniesParams,
  GetCompanyGroupsParams,
  GetCompanyCategoriesParams,
  CreateCompanyResponse,
  UpdateCompanyResponse,
  GetCompaniesResponse,
  GetCompanyGroupsResponse,
  GetCompanyCategoriesResponse,
  GetCompanyResponse,
  DeleteCompanyResponse,
  GetBusinessCategoriesWithGroupsResponse,
} from './types';

// Create Company
export const createCompanyRequest = async (
  data: CreateCompanyRequest,
): Promise<CreateCompanyResponse> => {
  const response = await apiClient.post('/companies', data);
  return response.data;
};

// Get Companies
export const getCompaniesRequest = async (
  params?: GetCompaniesParams,
): Promise<GetCompaniesResponse> => {
  const response = await apiClient.get('/companies', {params});
  return response.data;
};

// Get Company by ID
export const getCompanyRequest = async (
  id: number,
): Promise<GetCompanyResponse> => {
  const response = await apiClient.get(`/companies/${id}`);
  return response.data;
};

// Update Company
export const updateCompanyRequest = async (
  id: number,
  data: UpdateCompanyRequest,
): Promise<UpdateCompanyResponse> => {
  const response = await apiClient.put(`/companies/${id}`, data);
  return response.data;
};

// Delete Company
export const deleteCompanyRequest = async (
  id: number,
): Promise<DeleteCompanyResponse> => {
  const response = await apiClient.delete(`/companies/${id}`);
  return response.data;
};

// Get Company Groups
export const getCompanyGroupsRequest = async (
  params?: GetCompanyGroupsParams,
): Promise<GetCompanyGroupsResponse> => {
  const response = await apiClient.get('/company-groups', {params});
  return response.data;
};

// Get Company Categories
export const getCompanyCategoriesRequest = async (
  params?: GetCompanyCategoriesParams,
): Promise<GetCompanyCategoriesResponse> => {
  const response = await apiClient.get('/company-categories', {params});
  return response.data;
};

// Get Company Categories by Group
export const getCompanyCategoriesByGroupRequest = async (
  groupId: number,
  params?: Omit<GetCompanyCategoriesParams, 'group_id'>,
): Promise<GetCompanyCategoriesResponse> => {
  const response = await apiClient.get(`/company-groups/${groupId}/categories`, {
    params,
  });
  return response.data;
};

// Get Business Categories with Groups (nested structure)
export const getBusinessCategoriesWithGroupsRequest = async (): Promise<GetBusinessCategoriesWithGroupsResponse> => {
  const response = await apiClient.get('/business-categories/categories/groups');
  return response.data;
};
