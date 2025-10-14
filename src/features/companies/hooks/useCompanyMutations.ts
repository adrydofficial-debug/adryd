import { useState } from 'react';
import { companiesApi } from '../api';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../types';
import { ApiResponse } from '../types/response';

// Hook for company CRUD mutations
export const useCompanyMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create company mutation
  const createCompany = async (data: CreateCompanyRequest): Promise<Company | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await companiesApi.createCompany(data);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create company');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update company mutation
  const updateCompany = async (id: number, data: UpdateCompanyRequest): Promise<Company | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await companiesApi.updateCompany(id, data);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to update company');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete company mutation
  const deleteCompany = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await companiesApi.deleteCompany(id);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete company');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
    clearError,
  };
};

// Hook for company form management
export const useCompanyForm = (initialData?: Partial<Company>) => {
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    company_name: initialData?.company_name || '',
    company_category_id: initialData?.company_category_id,
    company_ntn: initialData?.company_ntn || '',
    address: initialData?.address || '',
    email: initialData?.email || '',
    contact_number: initialData?.contact_number || '',
    logo_url: initialData?.logo_url,
    logo_filename: initialData?.logo_filename,
    logo_size: initialData?.logo_size,
    logo_type: initialData?.logo_type,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const updateField = (field: keyof CreateCompanyRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.contact_number && !/^[\d\s\-\+\(\)]+$/.test(formData.contact_number)) {
      newErrors.contact_number = 'Please enter a valid contact number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      company_category_id: undefined,
      company_ntn: '',
      address: '',
      email: '',
      contact_number: '',
      logo_url: undefined,
      logo_filename: undefined,
      logo_size: undefined,
      logo_type: undefined,
    });
    setErrors({});
    setIsDirty(false);
  };

  const setFormDataFromCompany = (company: Company) => {
    setFormData({
      company_name: company.company_name,
      company_category_id: company.company_category_id,
      company_ntn: company.company_ntn || '',
      address: company.address || '',
      email: company.email || '',
      contact_number: company.contact_number || '',
      logo_url: company.logo_url,
      logo_filename: company.logo_filename,
      logo_size: company.logo_size,
      logo_type: company.logo_type,
    });
    setIsDirty(false);
  };

  return {
    formData,
    errors,
    isDirty,
    updateField,
    validateForm,
    resetForm,
    setFormDataFromCompany,
  };
};
