// src/features/legal/domain/entities.ts

/**
 * Domain entity for legal documents (Terms & Conditions, Privacy Policy)
 * This is the clean domain model used throughout the application
 */
export interface LegalDocument {
  id: number;
  type: 'terms' | 'privacy';
  version: string;
  content: string;
  isActive: boolean;
  lastUpdated: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Domain entity for document version information
 */
export interface DocumentVersion {
  version: string;
  lastUpdated: string;
}

/**
 * Domain entity for user agreements
 */
export interface UserAgreement {
  id: number;
  documentType: 'terms' | 'privacy';
  documentVersion: string;
  agreedAt: string;
}

/**
 * Domain entity for agreement check result
 */
export interface AgreementCheck {
  terms: {
    needsAgreement: boolean;
    userVersion: string | null;
    currentVersion: string;
    isUpToDate: boolean;
  };
  privacy: {
    needsAgreement: boolean;
    userVersion: string | null;
    currentVersion: string;
    isUpToDate: boolean;
  };
}

