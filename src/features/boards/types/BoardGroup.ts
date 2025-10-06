import {BoardCategory} from './BoardCategory';

export interface BoardGroup {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  categories: BoardCategory[];
}
