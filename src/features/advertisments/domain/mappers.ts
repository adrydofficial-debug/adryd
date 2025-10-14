import {
  AdvertisementBookingResponse,
  AdvertisementResponse,
  PaginatedAdvertisementsResponse,
} from '../api/types/responses';
import {
  Advertisement,
  BoardMini,
  Booking,
  CompanyMini,
  PaginatedAdvertisements,
} from './entities';

/* map single booking */
export const mapBooking = (b: AdvertisementBookingResponse): Booking => ({
  id: b.id,
  advertisementId: b.advertisement_id,
  boardId: b.board_id,
  startAt: b.start_at,
  endAt: b.end_at,
  createdAt: b.created_at,
});

/* map company/board minis */
const mapCompanyMini = (c: any): CompanyMini => ({
  id: c.id,
  companyName: c.company_name,
});

const mapBoardMini = (b: any): BoardMini => ({
  id: b.id,
  title: b.title ?? null,
  location: (b as any).location ?? null,
});

/* map advertisement */
export const mapAdvertisement = (a: AdvertisementResponse): Advertisement => ({
  id: a.id,
  companyId: a.company_id,
  userId: a.user_id,
  boardId: a.board_id,
  title: a.title,
  description: a.description ?? null,
  mediaUrl: a.media_url ?? null,
  mediaFilename: a.media_filename ?? null,
  mediaSize: a.media_size ?? null,
  mediaType: a.media_type ?? null,
  totalPayment: a.total_payment ?? null,
  status: a.status,
  createdAt: a.created_at,
  updatedAt: a.updated_at,
  company: a.company ? mapCompanyMini(a.company) : null,
  board: a.board ? mapBoardMini(a.board) : null,
  bookings: Array.isArray(a.bookings) ? a.bookings.map(mapBooking) : [],
});

/* map paginated advertisements */
export const mapPaginatedAdvertisements = (
  p: PaginatedAdvertisementsResponse,
): PaginatedAdvertisements => ({
  total: p.total,
  page: p.page,
  limit: p.limit,
  data: (p.data ?? []).map(mapAdvertisement),
});
