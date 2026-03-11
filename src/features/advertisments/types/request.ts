export interface CreateAdvertisementRequest {
  company_id?: number | null; // Optional for individual flow - can be null or omitted
  board_id: number;
  title: string;
  description: string;
  total_payment: number;
  bookings?: BookingRequest[];
}

export interface BookingRequest {
  start_at: string;
  end_at: string;
}

export interface UpdateAdvertisementRequest {
  id: number;
  company_id?: number;
  board_id?: number;
  title?: string;
  description?: string;
  total_payment?: number;
  bookings?: BookingRequest[];
}

export interface ChangeAdvertisementStatusRequest {
  id: number;
  status: 'active' | 'inactive' | 'paused' | 'completed';
}

export interface GetAdvertisementsRequest {
  page?: number;
  pageSize?: number;
  company_id?: number;
  board_id?: number;
  status?: string;
  search?: string;
}
