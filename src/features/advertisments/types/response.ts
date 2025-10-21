export interface CreateAdvertisementResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    company_id: number;
    board_id: number;
    title: string;
    description: string;
    total_payment: number;
    status: string;
    created_at: string;
    updated_at: string;
    bookings: BookingResponse[];
  };
}

export interface BookingResponse {
  id: number;
  advertisement_id: number;
  start_at: string;
  end_at: string;
  created_at: string;
  updated_at: string;
}

export interface Advertisement {
  id: number;
  company_id: number;
  board_id: number;
  title: string;
  description: string;
  total_payment: number;
  status: string;
  created_at: string;
  updated_at: string;
  bookings: BookingResponse[];
}

export interface GetAdvertisementsResponse {
  success: boolean;
  message: string;
  data: Advertisement[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface GetAdvertisementByIdResponse {
  success: boolean;
  message: string;
  data: Advertisement;
}

export interface UpdateAdvertisementResponse {
  success: boolean;
  message: string;
  data: Advertisement;
}

export interface DeleteAdvertisementResponse {
  success: boolean;
  message: string;
}

export interface ChangeAdvertisementStatusResponse {
  success: boolean;
  message: string;
  data: Advertisement;
}