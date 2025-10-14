import { useState } from 'react';
import { companyLogoApi } from '../api';
import { ApiResponse } from '../types/response';

// Hook for company logo operations
export const useCompanyLogo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload company logo
  const uploadLogo = async (companyId: number, logoFile: FormData): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await companyLogoApi.uploadLogo(companyId, logoFile);
      return response.data.logo_url;
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete company logo
  const deleteLogo = async (companyId: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await companyLogoApi.deleteLogo(companyId);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete logo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get logo URL
  const getLogoUrl = (companyId: number): string => {
    return companyLogoApi.getLogoUrl(companyId);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    uploadLogo,
    deleteLogo,
    getLogoUrl,
    clearError,
  };
};
