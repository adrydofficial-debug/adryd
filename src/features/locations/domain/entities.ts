// src/features/locations/domain/entities.ts
export interface Location {
  id: number;
  name: string;
  city_id: number;
  province_id: number;
  country_id: number;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: number;
  name: string;
  province_id: number;
  country_id: number;
  created_at: string;
  updated_at: string;
  province_name?: string;
  province_code?: string;
}
