// Response models for Country / Province / City / Location APIs

export interface CountryResponse {
  id: number;
  name: string;
  code?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProvinceResponse {
  id: number;
  name: string;
  country_id: number;
  country?: CountryResponse;
  created_at: string;
  updated_at: string;
}

export interface CityResponse {
  id: number;
  name: string;
  province_id: number;
  country_id: number;
  province?: ProvinceResponse;
  country?: CountryResponse;
  created_at: string;
  updated_at: string;
}

export interface LocationResponse {
  id: number;
  name: string;
  city_id: number;
  province_id: number;
  country_id: number;
  city?: CityResponse;
  province?: ProvinceResponse;
  country?: CountryResponse;
  created_at: string;
  updated_at: string;
}
