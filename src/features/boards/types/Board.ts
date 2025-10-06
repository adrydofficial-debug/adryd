// 🔹 Response Types
export interface Board {
  id: number;
  title: string;
  description: string | null;
  price: string;
  currency: string;
  location: string;
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  image_url: string | null;
  status: 'available' | 'unavailable' | string;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  category_id: number;
  owner_id: number;
}
