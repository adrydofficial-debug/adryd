// Request payloads for the API

export interface BookingRequest {
  start_at: string; // ISO
  end_at: string; // ISO
}

export interface CreateAdvertisementRequest {
  company_id: number;
  board_id: number;
  title: string;
  description?: string;
  media_url?: string;
  media_filename?: string;
  media_size?: number;
  media_type?: string;
  total_payment?: number;
  bookings?: BookingRequest[]; // optional array of bookings (slots)
}

export interface UpdateAdvertisementRequest {
  title?: string;
  description?: string;
  media_url?: string;
  media_filename?: string;
  media_size?: number;
  media_type?: string;
  total_payment?: number;
  // We do not allow direct bookings updates here by default; use a dedicated endpoint if needed.
}

export interface ChangeStatusRequest {
  new_status: string;
}

export interface UploadUrlRequest {
  filename: string;
  contentType: string;
}
