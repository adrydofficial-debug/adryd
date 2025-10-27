// src/features/users/api/types/requests.ts

/** Payload for requesting a signed upload URL for user avatar */
export interface UserUploadRequest {
  /** Example: "profile.png" */
  filename: string;

  /** Example: "image/png" */
  contentType: string;
}
