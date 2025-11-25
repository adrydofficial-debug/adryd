/**
 * @deprecated Use domain entities instead
 * This file is kept for backward compatibility
 * Re-exports from domain/entities.ts
 */

// Re-export domain entities (preferred)
export type {
  LegalDocument,
  DocumentVersion,
  UserAgreement,
  AgreementCheck,
} from '../domain/entities';

// Re-export API request types
export type { SubmitAgreementRequest } from '../api/types/responses';

