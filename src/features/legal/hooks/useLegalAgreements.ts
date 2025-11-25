import { useState, useEffect } from 'react';
import { legalAgreementsApi } from '../api/api';
import type { AgreementCheck, UserAgreement } from '../domain/entities';

export function useLegalAgreements() {
  const [agreements, setAgreements] = useState<UserAgreement[]>([]);
  const [checkResult, setCheckResult] = useState<AgreementCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAgreements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await legalAgreementsApi.getUserAgreements();
      setAgreements(data);
    } catch (err: any) {
      console.error('Error loading agreements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAgreements = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await legalAgreementsApi.checkAgreements();
      setCheckResult(result);
      return result;
    } catch (err: any) {
      console.error('Error checking agreements:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitAgreement = async (
    documentType: 'terms' | 'privacy',
    version: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await legalAgreementsApi.submitAgreement({
        document_type: documentType,
        document_version: version,
      });
      await loadAgreements(); // Refresh agreements list
      return true;
    } catch (err: any) {
      console.error('Error submitting agreement:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgreements();
  }, []);

  return {
    agreements,
    checkResult,
    loading,
    error,
    submitAgreement,
    checkAgreements,
    refresh: loadAgreements,
  };
}

