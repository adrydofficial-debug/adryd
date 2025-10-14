// Advertisement Status Enum
export enum AdvertisementStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Base Advertisement Interface
export interface Advertisement {
  id: number;
  user_id: number;
  company_id: number;
  board_id: number;
  title: string;
  description?: string;
  media_url?: string;
  media_filename?: string;
  media_size?: number;
  media_type?: string;
  total_payment?: number;
  status: AdvertisementStatus;
  created_at: Date;
  updated_at: Date;
}

// Advertisement with Relations
export interface AdvertisementWithRelations extends Advertisement {
  board: Board;
  company: Company;
  bookings: Booking[];
  payments: Payment[];
  status_changes?: AdvertisementStatusChange[];
}

// Board Interface
export interface Board {
  id: number;
  title: string;
  description?: string;
  location?: string;
  size?: string;
  price?: number;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

// Company Interface
export interface Company {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  created_at: Date;
  updated_at: Date;
}

// Booking Interface
export interface Booking {
  id: number;
  advertisement_id: number;
  start_date: Date;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
}

// Payment Interface
export interface Payment {
  id: number;
  advertisement_id: number;
  amount: number;
  status: string;
  payment_method?: string;
  transaction_id?: string;
  created_at: Date;
  updated_at: Date;
}

// Advertisement Status Change Interface
export interface AdvertisementStatusChange {
  id: number;
  advertisement_id: number;
  old_status: AdvertisementStatus;
  new_status: AdvertisementStatus;
  changed_by: number;
  created_at: Date;
}

// Create Advertisement Request
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
}

// Update Advertisement Request
export interface UpdateAdvertisementRequest {
  company_id?: number;
  board_id?: number;
  title?: string;
  description?: string;
  media_url?: string;
  media_filename?: string;
  media_size?: number;
  media_type?: string;
  total_payment?: number;
}

// Change Status Request
export interface ChangeStatusRequest {
  new_status: AdvertisementStatus;
}

// Query Parameters
export interface AdvertisementQueryParams {
  page?: number;
  limit?: number;
  status?: AdvertisementStatus;
}
