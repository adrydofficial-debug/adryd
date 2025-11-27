// src/features/legal/api/types/responses.ts

/**
 * API Response types - these match what the backend returns
 */

export interface LegalDocumentResponse {
  id: number;
  type: 'terms' | 'privacy';
  version: string;
  content: string;
  is_active: boolean;
  last_updated: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentVersionResponse {
  version: string;
  last_updated: string;
}

export interface UserAgreementResponse {
  id: number;
  document_type: 'terms' | 'privacy';
  document_version: string;
  agreed_at: string;
}

export interface AgreementCheckResponse {
  terms: {
    needs_agreement: boolean;
    user_version: string | null;
    current_version: string;
    is_up_to_date: boolean;
  };
  privacy: {
    needs_agreement: boolean;
    user_version: string | null;
    current_version: string;
    is_up_to_date: boolean;
  };
}

export interface SubmitAgreementRequest {
  document_type: 'terms' | 'privacy';
  document_version: string;
}

