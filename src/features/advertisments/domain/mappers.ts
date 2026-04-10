// src/features/advertisements/domain/mappers.ts
import {
  CreateAdvertisementRequest,
  UpdateAdvertisementRequest,
} from '../api/types/requests';
import {
  Advertisement,
  AdvertisementBooking,
  AdvertisementMedia,
  AdvertisementStatus,
  PaymentStatus,
  PaymentTransaction,
} from './entities';

// -------- API → DOMAIN -------- //

export const mapAdvertisementMedia = (data: any): AdvertisementMedia => ({
  id: data.id,
  url: data.url,
  filename: data.filename ?? undefined,
  size: data.size ?? undefined,
  type: data.type ?? undefined,
  sort_order: data.sort_order ?? undefined,
  created_at: data.created_at,
});

export const mapAdvertisementBooking = (data: any): AdvertisementBooking => ({
  id: data.id,
  board_id: data.board_id,
  start_at: data.start_at,
  end_at: data.end_at,
});

export const mapPaymentTransaction = (data: any): PaymentTransaction => ({
  id: data.id,
  advertisement_id: data.advertisement_id,
  provider: data.provider ?? null,
  reference_id: data.reference_id ?? null,
  amount: data.amount,
  currency: data.currency,
  status: data.status as PaymentStatus,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const mapAdvertisement = (data: any): Advertisement => ({
  id: data.id,
  company_id: data.company_id,
  user_id: data.user_id,
  board_id: data.board_id,
  title: data.title,
  description: data.description ?? undefined,
  total_payment: data.total_payment ?? undefined,
  status: data.status as AdvertisementStatus,
  created_at: data.created_at,
  updated_at: data.updated_at,
  board: data.board ?? undefined,
  company: data.company ?? undefined,
  bookings: data.bookings?.map(mapAdvertisementBooking) ?? [],
  payments: data.payments?.map(mapPaymentTransaction) ?? [],
  media: data.media?.map(mapAdvertisementMedia) ?? [],
});

// -------- DOMAIN → API -------- //

export const mapCreateAdvertisementRequest = (
  data: Partial<Advertisement>,
): CreateAdvertisementRequest => ({
  company_id: data.company_id!,
  board_id: data.board_id!,
  title: data.title!,
  description: data.description,
  total_payment: data.total_payment,
  bookings: data.bookings?.map(b => ({
    start_at: b.start_at,
    end_at: b.end_at,
  })),
  media: data.media?.map(m => ({
    url: m.url,
    filename: m.filename ?? '',
    size: m.size ?? 0,
    type: m.type ?? 'image/jpeg',
  })),
});

export const mapUpdateAdvertisementRequest = (
  data: Partial<Advertisement>,
): UpdateAdvertisementRequest => ({
  title: data.title,
  description: data.description,
  total_payment: data.total_payment,
  media: data.media?.map(m => ({
    url: m.url,
    filename: m.filename ?? '',
    size: m.size ?? 0,
    type: m.type ?? 'image/jpeg',
  })),
});

export const mapChatMediaPublicUrl = (publicUrl: string): string => {
  return publicUrl
    .replace('supabase.in', 'supabase.co')
    .replace('/object/public/', '/object/authenticated/');
};