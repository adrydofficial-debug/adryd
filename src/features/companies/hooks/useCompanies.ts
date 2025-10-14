import { useState, useEffect } from 'react';
import { companiesApi } from '../api';
import { Company, GetCompaniesQuery, CompanySearchFilters, CompanyStats } from '../types';
import { ApiResponse, PaginatedResponse } from '../types/response';

// Hook for fetching companies with pagination
export const useCompanies = (query?: GetCompaniesQuery) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companiesApi.getCompanies(query);
      setCompanies(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [query?.page, query?.limit, query?.search, query?.category_id, query?.group_id]);

  const refetch = () => {
    fetchCompanies();
  };

  return {
    companies,
    loading,
    error,
    pagination,
    refetch,
  };
};

// Hook for fetching a single company
export const useCompany = (id: number) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await companiesApi.getCompanyById(id);
      setCompany(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch company');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const refetch = () => {
    fetchCompany();
  };

  return {
    company,
    loading,
    error,
    refetch,
  };
};

// Hook for searching companies
export const useCompanySearch = (filters: CompanySearchFilters) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const searchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companiesApi.searchCompanies(filters);
      setCompanies(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to search companies');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setCompanies([]);
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  };

  return {
    companies,
    loading,
    error,
    pagination,
    searchCompanies,
    clearSearch,
  };
};

// Hook for company statistics
export const useCompanyStats = () => {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companiesApi.getCompanyStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch company statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refetch,
  };
};