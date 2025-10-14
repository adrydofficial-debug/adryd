import { useState } from 'react';
import { companyValidationApi } from '../api';
import { ApiResponse } from '../types/response';

// Hook for company validation
export const useCompanyValidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate company name uniqueness
  const validateCompanyName = async (name: string, excludeId?: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await companyValidationApi.validateCompanyName(name, excludeId);
      return response.data.isUnique;
    } catch (err: any) {
      setError(err.message || 'Failed to validate company name');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Validate company NTN uniqueness
  const validateCompanyNTN = async (ntn: string, excludeId?: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await companyValidationApi.validateCompanyNTN(ntn, excludeId);
      return response.data.isUnique;
    } catch (err: any) {
      setError(err.message || 'Failed to validate company NTN');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Validate company email uniqueness
  const validateCompanyEmail = async (email: string, excludeId?: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await companyValidationApi.validateCompanyEmail(email, excludeId);
      return response.data.isUnique;
    } catch (err: any) {
      setError(err.message || 'Failed to validate company email');
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
    validateCompanyName,
    validateCompanyNTN,
    validateCompanyEmail,
    clearError,
  };
};
