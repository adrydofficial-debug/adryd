import { useState, useEffect } from 'react';
import { companyCategoriesApi } from '../api';
import { CompanyCategory, CompanyCategoryGroup, GetCategoriesQuery } from '../types';
import { ApiResponse } from '../types/response';

// Hook for fetching company category groups
export const useCompanyCategoryGroups = () => {
  const [groups, setGroups] = useState<CompanyCategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companyCategoriesApi.getCategoryGroups();
      setGroups(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch category groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const refetch = () => {
    fetchGroups();
  };

  return {
    groups,
    loading,
    error,
    refetch,
  };
};

// Hook for fetching company categories
export const useCompanyCategories = (query?: GetCategoriesQuery) => {
  const [categories, setCategories] = useState<CompanyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companyCategoriesApi.getCategories(query);
      setCategories(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [query?.group_id]);

  const refetch = () => {
    fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refetch,
  };
};

// Hook for fetching categories by group
export const useCategoriesByGroup = (groupId: number) => {
  const [categories, setCategories] = useState<CompanyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoriesByGroup = async () => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await companyCategoriesApi.getCategoriesByGroup(groupId);
      setCategories(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories by group');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesByGroup();
  }, [groupId]);

  const refetch = () => {
    fetchCategoriesByGroup();
  };

  return {
    categories,
    loading,
    error,
    refetch,
  };
};

// Hook for fetching a single category
export const useCompanyCategory = (id: number) => {
  const [category, setCategory] = useState<CompanyCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await companyCategoriesApi.getCategoryById(id);
      setCategory(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch category');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const refetch = () => {
    fetchCategory();
  };

  return {
    category,
    loading,
    error,
    refetch,
  };
};
