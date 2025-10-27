// src/features/boards/domain/entities.ts

export interface Board {
  id: number;
  title: string;
  image: string;
  rating: number;
  totalRatings: number;
  price?: number;
  location?: string;
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

export interface Rating {
  id: number;
  user: {
    id: string;
    name?: string | null;
    avatar?: string | null;
  };
  comment: string;
  stars: number;
  createdAt: string;
}

export interface RatingSummary {
  average: number;
  total: number;
  recent: Rating[];
  breakdown: Record<number, number>;
}
