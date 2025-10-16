import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  fetchCompanies,
  fetchCompaniesByCategory,
  fetchCompanyCategories,
  fetchCompanyCategoryGroups,
  fetchCompanyById,
} from './api/api';
import { Company, CompanyCategoryGroup } from './types';
import { PaginatedResponse } from './types/response';
interface Filters {
  pageSize?: number;
  offset?: number;
  search?: string;
  category_id?: number;
  group_id?: number;
  [key: string]: any;
}

// ✅ All Companies (page-based)
export const useCompanies = (filters: Filters = {}) =>
  useInfiniteQuery<PaginatedResponse<Company>, Error>({
    queryKey: ['companies', filters],
    queryFn: async ({ pageParam = 1 }) =>
      fetchCompanies({
        ...filters,
        page: pageParam,
        pageSize: filters.pageSize || 10,
      }),
    getNextPageParam: lastPage =>
      lastPage?.pagination?.totalPages > lastPage?.pagination?.page 
        ? lastPage.pagination.page + 1 
        : undefined,
    initialPageParam: 1, // 🔹 REQUIRED
  });

// ✅ Company Categories
export const useCompanyCategories = (params: Filters = {}) =>
  useQuery<CompanyCategoryGroup[], Error>({
    queryKey: ['companyCategories', params],
    queryFn: async () => {
      const res = await fetchCompanyCategoryGroups();
      return res || [];
    },
  });

// ✅ Company Category Groups
export const useCompanyCategoryGroups = (params: Filters = {}) =>
  useQuery<CompanyCategoryGroup[], Error>({
    queryKey: ['companyCategoryGroups', params],
    queryFn: async () => {
      const res = await fetchCompanyCategoryGroups();
      return res || [];
    },
  });

// ✅ Companies by Category (offset-based)
export const useCompaniesByCategory = (
  categoryId: string | null,
  filters: Filters = {},
) =>
  useInfiniteQuery<PaginatedResponse<Company>, Error>({
    queryKey: ['companiesByCategory', categoryId, filters],
    queryFn: async ({ pageParam = 0 }) =>
      fetchCompaniesByCategory(categoryId!, { ...filters, offset: pageParam }),
    getNextPageParam: lastPage =>
      lastPage?.pagination?.totalPages > lastPage?.pagination?.page 
        ? lastPage.pagination.page + 1 
        : undefined,
    enabled: !!categoryId,
    initialPageParam: 0, // 🔹 REQUIRED
  });

// ✅ Single Company
export const useCompany = (id: number) =>
  useQuery<Company, Error>({
    queryKey: ['company', id],
    queryFn: async () => {
      const res = await fetchCompanyById(id);
      return res.data;
    },
    enabled: !!id,
  });
