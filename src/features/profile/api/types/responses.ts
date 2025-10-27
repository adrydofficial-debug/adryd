// src/features/users/api/types/responses.ts

/** Response structure from /api/users/upload-avatar-url */
export interface UserUploadInfoResponse {
  /** Signed URL to PUT the file */
  uploadUrl: string;

  /** Storage key in Supabase */
  key: string;

  /** Publicly accessible file URL */
  publicUrl: string;
}
