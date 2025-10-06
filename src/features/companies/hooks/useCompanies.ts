// src/features/companies/hooks/useCompanies.ts

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  createCompanyRequest,
  getCompaniesRequest,
  getCompanyRequest,
  updateCompanyRequest,
  deleteCompanyRequest,
  getCompanyGroupsRequest,
  getCompanyCategoriesRequest,
  getCompanyCategoriesByGroupRequest,
  getBusinessCategoriesWithGroupsRequest,
} from '../api';
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
  GetCompaniesParams,
  GetCompanyGroupsParams,
  GetCompanyCategoriesParams,
} from '../types';

// Query Keys
export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (params: GetCompaniesParams) => [...companyKeys.lists(), params] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: number) => [...companyKeys.details(), id] as const,
  groups: () => [...companyKeys.all, 'groups'] as const,
  groupsList: (params: GetCompanyGroupsParams) => [...companyKeys.groups(), params] as const,
  categories: () => [...companyKeys.all, 'categories'] as const,
  categoriesList: (params: GetCompanyCategoriesParams) => [...companyKeys.categories(), params] as const,
  categoriesByGroup: (groupId: number, params?: Omit<GetCompanyCategoriesParams, 'group_id'>) => 
    [...companyKeys.categories(), 'byGroup', groupId, params] as const,
  categoriesWithGroups: () => [...companyKeys.categories(), 'withGroups'] as const,
};

// Get Companies
export const useCompanies = (params?: GetCompaniesParams) => {
  return useQuery({
    queryKey: companyKeys.list(params || {}),
    queryFn: () => getCompaniesRequest(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Company by ID
export const useCompany = (id: number) => {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => getCompanyRequest(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get Company Groups
export const useCompanyGroups = (params?: GetCompanyGroupsParams) => {
  return useQuery({
    queryKey: companyKeys.groupsList(params || {}),
    queryFn: () => getCompanyGroupsRequest(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get Company Categories
export const useCompanyCategories = (params?: GetCompanyCategoriesParams) => {
  return useQuery({
    queryKey: companyKeys.categoriesList(params || {}),
    queryFn: () => getCompanyCategoriesRequest(params),
    staleTime: 10 * 60 * 1000,
  });
};

// Get Company Categories by Group
export const useCompanyCategoriesByGroup = (
  groupId: number,
  params?: Omit<GetCompanyCategoriesParams, 'group_id'>,
) => {
  return useQuery({
    queryKey: companyKeys.categoriesByGroup(groupId, params),
    queryFn: () => getCompanyCategoriesByGroupRequest(groupId, params),
    enabled: !!groupId,
    staleTime: 10 * 60 * 1000,
  });
};

// Get Business Categories with Groups (nested structure)
export const useBusinessCategoriesWithGroups = () => {
  return useQuery({
    queryKey: companyKeys.categoriesWithGroups(),
    queryFn: getBusinessCategoriesWithGroupsRequest,
    staleTime: 15 * 60 * 1000, // 15 minutes - this data changes less frequently
  });
};

// Create Company
export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCompanyRequest,
    onSuccess: () => {
      // Invalidate and refetch companies list
      queryClient.invalidateQueries({queryKey: companyKeys.lists()});
    },
  });
};

// Update Company
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({id, data}: {id: number; data: UpdateCompanyRequest}) =>
      updateCompanyRequest(id, data),
    onSuccess: (_, {id}) => {
      // Invalidate specific company and companies list
      queryClient.invalidateQueries({queryKey: companyKeys.detail(id)});
      queryClient.invalidateQueries({queryKey: companyKeys.lists()});
    },
  });
};

// Delete Company
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCompanyRequest,
    onSuccess: () => {
      // Invalidate companies list
      queryClient.invalidateQueries({queryKey: companyKeys.lists()});
    },
  });
};
