import apiClient from '../../../services/apiClient';
import { Company, CompanyCategory, CompanyCategoryGroup } from '../types';
import { 
  CreateCompanyRequest, 
  UpdateCompanyRequest, 
  GetCompaniesQuery, 
  GetCategoriesQuery,
  CompanySearchFilters
} from '../types';
import { 
  ApiResponse, 
  PaginatedResponse, 
  CompanyListResponse,
  CompanyCategoryListResponse,
  CompanyCategoryGroupListResponse,
  CompanyStatsResponse,
  CompanyExportResponse,
  CompanyImportResponse,
  CompanyValidationResponse,
  CompanyLogoUploadResponse,
  CompanyLogoDeleteResponse
} from '../types/response';

// Company CRUD Operations
export const companiesApi = {
  // Get all companies for the logged-in user
  getCompanies: async (query?: GetCompaniesQuery): Promise<PaginatedResponse<Company>> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.category_id) params.append('category_id', query.category_id.toString());
    if (query?.group_id) params.append('group_id', query.group_id.toString());

    const response = await apiClient.get(`/companies?${params.toString()}`);
    return response.data;
  },

  // Get a single company by ID
  getCompanyById: async (id: number): Promise<ApiResponse<Company>> => {
    const response = await apiClient.get(`/companies/${id}`);
    return response.data;
  },

  // Create a new company
  createCompany: async (data: CreateCompanyRequest): Promise<Company> => {
    const response = await apiClient.post('/api/companies', data);
    console.log('createCompany raw response:', { status: response.status, data: response.data });
    
    // Handle different response shapes
    let companyData: any = response.data;
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      companyData = response.data.data;
    }
    
    if (!companyData || !companyData.id) {
      throw new Error(response.data?.message || 'Failed to create company');
    }
    
    return companyData;
  },

  // Update a company
  updateCompany: async (id: number, data: UpdateCompanyRequest): Promise<ApiResponse<Company>> => {
    const response = await apiClient.put(`/companies/${id}`, data);
    return response.data;
  },

  // Delete a company
  deleteCompany: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete(`/companies/${id}`);
    return response.data;
  },

  // Search companies with filters
  searchCompanies: async (filters: CompanySearchFilters): Promise<PaginatedResponse<Company>> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category_id) params.append('category_id', filters.category_id.toString());
    if (filters.group_id) params.append('group_id', filters.group_id.toString());
    if (filters.has_logo !== undefined) params.append('has_logo', filters.has_logo.toString());
    if (filters.location) params.append('location', filters.location);

    const response = await apiClient.get(`/companies/search?${params.toString()}`);
    return response.data;
  },

  // Get company statistics
  getCompanyStats: async (): Promise<CompanyStatsResponse> => {
    const response = await apiClient.get('/companies/stats');
    return response.data;
  },

  // Export companies data
  exportCompanies: async (filters?: CompanySearchFilters): Promise<CompanyExportResponse> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    if (filters?.group_id) params.append('group_id', filters.group_id.toString());

    const response = await apiClient.get(`/companies/export?${params.toString()}`);
    return response.data;
  },

  // Import companies data
  importCompanies: async (file: FormData): Promise<CompanyImportResponse> => {
    const response = await apiClient.post('/companies/import', file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Export functions for hooks (matching boards pattern)
export const fetchCompanies = companiesApi.getCompanies;
export const fetchCompanyById = companiesApi.getCompanyById;
export const fetchCompaniesByCategory = async (categoryId: string, filters: any = {}) => {
  return companiesApi.getCompanies({ ...filters, category_id: parseInt(categoryId) });
};
export const fetchCompanyCategories = companyCategoriesApi.getCategories;
export const fetchCompanyCategoryGroups = companyCategoriesApi.getCategoryGroups;

// Company Categories API
export const companyCategoriesApi = {
  // Get all company category groups (with their categories)
  getCategoryGroups: async (): Promise<CompanyCategoryGroup[]> => {
    const response = await apiClient.get('/api/companies/categories/groups');
    console.log('getCategoryGroups raw response:', { status: response.status, data: response.data });
    
    // Handle different response shapes
    let groupsData: any = response.data;
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      groupsData = response.data.data;
    }
    
    return Array.isArray(groupsData) ? groupsData : [];
  },

  // Get all categories (flat list, optionally filter by group_id)
  getCategories: async (query?: GetCategoriesQuery): Promise<ApiResponse<CompanyCategory[]>> => {
    const params = new URLSearchParams();
    if (query?.group_id) params.append('group_id', query.group_id.toString());

    const response = await apiClient.get(`/companies/categories?${params.toString()}`);
    return response.data;
  },

  // Get a single category by ID
  getCategoryById: async (id: number): Promise<ApiResponse<CompanyCategory>> => {
    const response = await apiClient.get(`/companies/categories/${id}`);
    return response.data;
  },

  // Get categories by group ID
  getCategoriesByGroup: async (groupId: number): Promise<ApiResponse<CompanyCategory[]>> => {
    const response = await apiClient.get(`/companies/categories?group_id=${groupId}`);
    return response.data;
  },
};

// Company Logo Operations
export const companyLogoApi = {
  // Upload company logo
  uploadLogo: async (companyId: number, logoFile: FormData): Promise<CompanyLogoUploadResponse> => {
    const response = await apiClient.post(`/companies/${companyId}/logo`, logoFile, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete company logo
  deleteLogo: async (companyId: number): Promise<CompanyLogoDeleteResponse> => {
    const response = await apiClient.delete(`/companies/${companyId}/logo`);
    return response.data;
  },

  // Get company logo URL
  getLogoUrl: (companyId: number): string => {
    return `${apiClient.defaults.baseURL}/companies/${companyId}/logo`;
  },
};

// Company Validation
export const companyValidationApi = {
  // Validate company name uniqueness
  validateCompanyName: async (name: string, excludeId?: number): Promise<CompanyValidationResponse> => {
    const params = new URLSearchParams();
    params.append('name', name);
    if (excludeId) params.append('exclude_id', excludeId.toString());

    const response = await apiClient.get(`/companies/validate/name?${params.toString()}`);
    return response.data;
  },

  // Validate company NTN uniqueness
  validateCompanyNTN: async (ntn: string, excludeId?: number): Promise<CompanyValidationResponse> => {
    const params = new URLSearchParams();
    params.append('ntn', ntn);
    if (excludeId) params.append('exclude_id', excludeId.toString());

    const response = await apiClient.get(`/companies/validate/ntn?${params.toString()}`);
    return response.data;
  },

  // Validate company email uniqueness
  validateCompanyEmail: async (email: string, excludeId?: number): Promise<CompanyValidationResponse> => {
    const params = new URLSearchParams();
    params.append('email', email);
    if (excludeId) params.append('exclude_id', excludeId.toString());

    const response = await apiClient.get(`/companies/validate/email?${params.toString()}`);
    return response.data;
  },
};


