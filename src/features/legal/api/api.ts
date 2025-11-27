import apiClient from '../../../services/apiClient';
import type {
  LegalDocumentResponse,
  DocumentVersionResponse,
  UserAgreementResponse,
  AgreementCheckResponse,
  SubmitAgreementRequest,
} from './types/responses';
import {
  mapLegalDocument,
  mapDocumentVersion,
  mapUserAgreement,
  mapAgreementCheck,
} from '../domain/mappers';
import type {
  LegalDocument,
  DocumentVersion,
  UserAgreement,
  AgreementCheck,
} from '../domain/entities';

const BASE_URL = '/api/legal';

// Public endpoints (no auth required)
export const legalDocumentsApi = {
  // Get latest Terms & Conditions
  async getTerms(): Promise<LegalDocument> {
    const response = await apiClient.get<{ success: boolean; data: LegalDocumentResponse }>(
      `${BASE_URL}/terms`,
      { skipAuth: true } as any // Public endpoint
    );
    return mapLegalDocument(response.data.data);
  },

  // Get latest Privacy Policy
  async getPrivacy(): Promise<LegalDocument> {
    const response = await apiClient.get<{ success: boolean; data: LegalDocumentResponse }>(
      `${BASE_URL}/privacy`,
      { skipAuth: true } as any // Public endpoint
    );
    return mapLegalDocument(response.data.data);
  },

  // Get Terms version (lightweight)
  async getTermsVersion(): Promise<DocumentVersion> {
    const response = await apiClient.get<{ success: boolean; data: DocumentVersionResponse }>(
      `${BASE_URL}/terms/version`,
      { skipAuth: true } as any
    );
    return mapDocumentVersion(response.data.data);
  },

  // Get Privacy version (lightweight)
  async getPrivacyVersion(): Promise<DocumentVersion> {
    const response = await apiClient.get<{ success: boolean; data: DocumentVersionResponse }>(
      `${BASE_URL}/privacy/version`,
      { skipAuth: true } as any
    );
    return mapDocumentVersion(response.data.data);
  },
};

// Authenticated endpoints
export const legalAgreementsApi = {
  // Submit user agreement
  async submitAgreement(data: SubmitAgreementRequest): Promise<UserAgreement> {
    const response = await apiClient.post<{ success: boolean; data: UserAgreementResponse }>(
      `${BASE_URL}/agreements`,
      data
    );
    return mapUserAgreement(response.data.data);
  },

  // Get user's agreements
  async getUserAgreements(): Promise<UserAgreement[]> {
    const response = await apiClient.get<{ success: boolean; data: UserAgreementResponse[] }>(
      `${BASE_URL}/agreements`
    );
    return response.data.data.map(mapUserAgreement);
  },

  // Check if re-agreement needed
  async checkAgreements(): Promise<AgreementCheck> {
    const response = await apiClient.get<{ success: boolean; data: AgreementCheckResponse }>(
      `${BASE_URL}/agreements/check`
    );
    return mapAgreementCheck(response.data.data);
  },
};

