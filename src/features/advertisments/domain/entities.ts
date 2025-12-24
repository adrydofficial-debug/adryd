// src/features/advertisements/domain/entities.ts
import { Board } from '../../boards/domain/entities';
import { Company } from '../../companies/domain/entities';

export interface AdvertisementMedia {
  id: number;
  url: string;
  filename?: string;
  size?: number;
  type?: string;
  sort_order?: number;
  created_at: string;
}

export interface AdvertisementBooking {
  id: number;
  board_id: number;
  start_at: string;
  end_at: string;
}

export interface Advertisement {
  id: number;
  company_id: number;
  user_id: string;
  board_id: number;
  title: string;
  description?: string;
  total_payment?: number;
  status: AdvertisementStatus;
  created_at: string;
  updated_at: string;
  board?: Board;
  company?: Company;
  bookings?: AdvertisementBooking[];
  payments?: PaymentTransaction[];
  media?: AdvertisementMedia[];
}

export enum AdvertisementStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface AdvertisementStatusModel {
  value: AdvertisementStatus;
  label: string;
  description?: string;
  color: string; // e.g. Tailwind or hex
  next?: AdvertisementStatus[]; // possible transitions
}

export const ADVERTISEMENT_STATUSES: AdvertisementStatusModel[] = [
  {
    value: AdvertisementStatus.DRAFT,
    label: 'Draft',
    description: 'Unsubmitted advertisement, still being edited.',
    color: 'gray',
    next: [AdvertisementStatus.PAYMENT_PENDING],
  },
  {
    value: AdvertisementStatus.PAYMENT_PENDING,
    label: 'Payment Pending',
    description: 'Awaiting payment before review.',
    color: 'yellow',
    next: [AdvertisementStatus.UNDER_REVIEW, AdvertisementStatus.CANCELLED],
  },
  {
    value: AdvertisementStatus.UNDER_REVIEW,
    label: 'Under Review',
    description: 'Being reviewed by the moderation team.',
    color: 'blue',
    next: [AdvertisementStatus.APPROVED, AdvertisementStatus.REJECTED],
  },
  {
    value: AdvertisementStatus.APPROVED,
    label: 'Approved',
    description: 'Approved and ready to schedule or publish.',
    color: 'green',
    next: [AdvertisementStatus.SCHEDULED, AdvertisementStatus.PUBLISHED],
  },
  {
    value: AdvertisementStatus.REJECTED,
    label: 'Rejected',
    description: 'Rejected by moderation team, editable again.',
    color: 'red',
    next: [AdvertisementStatus.DRAFT],
  },
  {
    value: AdvertisementStatus.SCHEDULED,
    label: 'Scheduled',
    description: 'Set to go live at a future date.',
    color: 'purple',
    next: [AdvertisementStatus.PUBLISHED, AdvertisementStatus.CANCELLED],
  },
  {
    value: AdvertisementStatus.PUBLISHED,
    label: 'Published',
    description: 'Currently live and displaying content.',
    color: 'emerald',
    next: [AdvertisementStatus.COMPLETED, AdvertisementStatus.CANCELLED],
  },
  {
    value: AdvertisementStatus.COMPLETED,
    label: 'Completed',
    description: 'Ad campaign finished successfully.',
    color: 'teal',
  },
  {
    value: AdvertisementStatus.CANCELLED,
    label: 'Cancelled',
    description: 'Stopped before completion.',
    color: 'rose',
  },
];

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface PaymentTransaction {
  id: number;
  advertisement_id: number;
  provider?: string | null;
  reference_id?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}
