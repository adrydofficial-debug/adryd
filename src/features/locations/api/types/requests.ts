// Request payloads for Country / Province / City / Location APIs

export interface GetLocationsRequest {
  city_id?: number;
}

export interface GetCityByIdRequest {
  id: number;
}

export interface FilterBoardsByLocationRequest {
  location_id?: number | number[];
  city_id?: number;
}
