// Response shapes returned from the backend (matches Prisma models)
export interface AdvertisementBookingResponse {
  id: number;
  advertisement_id: number;
  board_id: number;
  start_at: string; // ISO
  end_at: string; // ISO
  created_at: string;
}

export interface CompanyMiniResponse {
  id: number;
  company_name: string;
}

export interface BoardMiniResponse {
  id: number;
  title?: string | null;
  location?: string | null;
}

export interface AdvertisementResponse {
  id: number;
  company_id: number;
  user_id: string;
  board_id: number;
  title: string;
  description?: string | null;
  media_url?: string | null;
  media_filename?: string | null;
  media_size?: number | null;
  media_type?: string | null;
  total_payment?: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  company?: CompanyMiniResponse | null;
  board?: BoardMiniResponse | null;
  bookings?: AdvertisementBookingResponse[];
  payments?: any[]; // keep flexible
  status_changes?: any[];
}

export interface PaginatedAdvertisementsResponse {
  total: number;
  page: number;
  limit: number;
  data: AdvertisementResponse[];
}
