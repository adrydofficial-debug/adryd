// src/features/legal/domain/mappers.ts

import type {
  LegalDocumentResponse,
  DocumentVersionResponse,
  UserAgreementResponse,
  AgreementCheckResponse,
} from '../api/types/responses';
import type {
  LegalDocument,
  DocumentVersion,
  UserAgreement,
  AgreementCheck,
} from './entities';

/**
 * Map API response to domain entity for Legal Document
 */
export const mapLegalDocument = (data: LegalDocumentResponse): LegalDocument => ({
  id: data.id,
  type: data.type,
  version: data.version,
  content: data.content,
  isActive: data.is_active,
  lastUpdated: data.last_updated,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

/**
 * Map API response to domain entity for Document Version
 */
export const mapDocumentVersion = (data: DocumentVersionResponse): DocumentVersion => ({
  version: data.version,
  lastUpdated: data.last_updated,
});

/**
 * Map API response to domain entity for User Agreement
 */
export const mapUserAgreement = (data: UserAgreementResponse): UserAgreement => ({
  id: data.id,
  documentType: data.document_type,
  documentVersion: data.document_version,
  agreedAt: data.agreed_at,
});

/**
 * Map API response to domain entity for Agreement Check
 */
export const mapAgreementCheck = (data: AgreementCheckResponse): AgreementCheck => ({
  terms: {
    needsAgreement: data.terms.needs_agreement,
    userVersion: data.terms.user_version,
    currentVersion: data.terms.current_version,
    isUpToDate: data.terms.is_up_to_date,
  },
  privacy: {
    needsAgreement: data.privacy.needs_agreement,
    userVersion: data.privacy.user_version,
    currentVersion: data.privacy.current_version,
    isUpToDate: data.privacy.is_up_to_date,
  },
});

