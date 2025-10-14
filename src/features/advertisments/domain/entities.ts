// Domain entities used in the app (converted/mapped from responses)

export interface Booking {
  id?: number;
  advertisementId?: number;
  boardId: number;
  startAt: string; // ISO
  endAt: string;   // ISO
  createdAt?: string;
}

export interface CompanyMini {
  id: number;
  companyName: string;
}

export interface BoardMini {
  id: number;
  title?: string | null;
  location?: string | null;
}

export interface Advertisement {
  id?: number;
  companyId: number;
  userId?: string;
  boardId: number;
  title: string;
  description?: string | null;
  mediaUrl?: string | null;
  mediaFilename?: string | null;
  mediaSize?: number | null;
  mediaType?: string | null;
  totalPayment?: number | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  company?: CompanyMini | null;
  board?: BoardMini | null;
  bookings?: Booking[];
}

export interface PaginatedAdvertisements {
  total: number;
  page: number;
  limit: number;
  data: Advertisement[];
}
