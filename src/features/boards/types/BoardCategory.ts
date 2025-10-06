import {Board} from './Board';

export interface BoardCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  group_id: number;
  boards: Board[];
}
