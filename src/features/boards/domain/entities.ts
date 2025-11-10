// src/features/boards/domain/entities.ts

import { UserProfile } from '../../companies/domain/entities';
import { Location } from '../../locations/domain/entities';

export interface Board {
  id: number;
  title: string;
  description?: string | null;
  price?: number | null;
  currency?: string;
  width?: number | null;
  height?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: string;
  slug: string;

  // 👇 Relations
  category?: Category;
  owner?: UserProfile;
  location?: Location;

  // 👇 Media
  media?: BoardMedia[];

  // 👇 Ratings summary
  avg_rating: number;
  total_ratings: number;

  // 👇 Miscellaneous
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

/* -------------------------------------------------------------------------- */
/* 📸 Board Media                                                             */
/* -------------------------------------------------------------------------- */
export interface BoardMedia {
  url: string;
  filename?: string | null;
  size?: number | null;
  type?: string | null;
  sort_order?: number;
}

export interface Category {
  id: number;
  name: string;
  boards: Board[];
}

export interface BoardCategoryGroup {
  id: number;
  name: string;
  categories: Category[];
}

export interface FilterMeta {
  name: string;
  slug: string;
}

export interface Filters {
  filters: FilterMeta[];
  groups: BoardCategoryGroup[];
  recommended: Board[];
  nearest: Board[];
  seeAll: Board[];
}

export interface PaginatedBoards {
  boards: Board[];
  page: number;
  totalPages: number;
}

// export interface Rating {
//   id: number;
//   user: {
//     id: string;
//     name?: string | null;
//     avatar?: string | null;
//   };
//   comment: string;
//   stars: number;
//   createdAt: string;
// }

// export interface RatingSummary {
//   average: number;
//   total: number;
//   recent: Rating[];
//   breakdown: Record<number, number>;
// }
