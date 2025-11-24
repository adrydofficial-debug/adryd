// src/features/location/mappers.ts
import { City, Location } from './entities';

export const mapLocation = (raw: any): Location => ({
  id: raw.id,
  name: raw.name,
  city_id: raw.city_id,
  province_id: raw.province_id,
  country_id: raw.country_id,
  created_at: raw.created_at,
  updated_at: raw.updated_at,
});

export const mapCity = (raw: any): City => ({
  id: raw.id,
  name: raw.name,
  province_id: raw.province_id,
  country_id: raw.country_id,
  created_at: raw.created_at,
  updated_at: raw.updated_at,
  province_name: raw.province?.name,
  province_code: raw.province?.code,
});
