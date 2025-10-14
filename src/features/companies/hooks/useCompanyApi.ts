// src/features/companies/hooks/useCompanyApi.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companiesApi, companyCategoriesApi } from '../api';
import { CreateCompanyRequest, UpdateCompanyRequest, GetCompaniesQuery, GetCategoriesQuery } from '../types';

// Query Keys
export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (query?: GetCompaniesQuery) => [...companyKeys.lists(), query] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: number) => [...companyKeys.details(), id] as const,
  stats: () => [...companyKeys.all, 'stats'] as const,
};

export const categoryKeys = {
  all: ['company-categories'] as const,
  groups: () => [...categoryKeys.all, 'groups'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (query?: GetCategoriesQuery) => [...categoryKeys.lists(), query] as const,
  detail: (id: number) => [...categoryKeys.all, 'detail', id] as const,
};

// Company Hooks
export const useCompanies = (query?: GetCompaniesQuery) => {
  return useQuery({
    queryKey: companyKeys.list(query),
    queryFn: () => companiesApi.getCompanies(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCompany = (id: number) => {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => companiesApi.getCompanyById(id),
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => companiesApi.createCompany(data),
    onSuccess: () => {
      // Invalidate and refetch companies list
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompanyRequest }) => 
      companiesApi.updateCompany(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific company and lists
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => companiesApi.deleteCompany(id),
    onSuccess: () => {
      // Invalidate and refetch companies list
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
};

// Category Hooks
export const useCompanyCategoryGroups = () => {
  return useQuery({
    queryKey: categoryKeys.groups(),
    queryFn: () => companyCategoriesApi.getCategoryGroups(),
    staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
  });
};

export const useCompanyCategories = (query?: GetCategoriesQuery) => {
  return useQuery({
    queryKey: categoryKeys.list(query),
    queryFn: () => companyCategoriesApi.getCategories(query),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCompanyCategory = (id: number) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => companyCategoriesApi.getCategoryById(id),
    enabled: !!id,
  });
};
