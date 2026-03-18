import { create } from 'zustand';
import {
  fetchBoardFilters,
  fetchFilteredBoards,
} from '../features/boards/api/api';
import { FilterBoardsParams } from '../features/boards/api/types/requests';
import { Board, Filters } from '../features/boards/domain/entities';
import {
  mapFilteredBoards,
  mapFiltersResponse,
} from '../features/boards/domain/mappers';
import { LocationApi } from '../features/locations/api/api';
import { City, Location } from '../features/locations/domain/entities';
import { mapCity, mapLocation } from '../features/locations/domain/mappers';

interface AppStore {
  cities: City[];
  isCitiesLoading: boolean;
  citiesError: unknown;
  selectedCity: City | null;

  locationsByCity: Record<number, Location[]>;
  isLocationsLoading: boolean;
  locationsError: unknown;
  selectedLocation: Location | null;

  boardFiltersByCity: Record<number, Filters>;
  isBoardFiltersLoading: boolean;
  boardFiltersError: unknown;

  appliedFilters: Set<string>;
  appliedFilterOrder: string[];

  filteredBoards: Board[];
  filterPagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };

  isFiltering: boolean;
  filterError: string | null;

  searchQuery: string;

  setSearchQuery: (query: string) => void;
  applyFilters: (params?: { page?: number }) => Promise<void>;
  loadMoreBoards: () => Promise<void>;

  buildFilterPayload: (page: number) => FilterBoardsParams;

  setSelectedCity: (city: City) => Promise<void>;
  setSelectedLocation: (location: Location | null) => void;

  fetchCities: () => Promise<void>;
  fetchLocations: (cityId: number) => Promise<void>;
  fetchBoardFilters: (cityId: number) => Promise<void>;

  getCurrentBoardFilters: () => Filters | null;
  getCurrentLocations: () => Location[] | null;
  getEffectiveLocation: () => { city_id?: number; location_id?: number } | null;

  setAppliedFilters: (filters: Set<string>) => void;
  setAppliedFilterOrder: (order: string[]) => void;

  resetStore: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  searchQuery: '',
  selectedCity: null,
  selectedLocation: null,

  cities: [],
  isCitiesLoading: false,
  citiesError: null,

  locationsByCity: {},
  isLocationsLoading: false,
  locationsError: null,

  boardFiltersByCity: {},
  isBoardFiltersLoading: false,
  boardFiltersError: null,

  appliedFilters: new Set(),
  appliedFilterOrder: [],

  filteredBoards: [],
  filterPagination: { page: 1, totalPages: 1, total: 0, limit: 10 },

  isFiltering: false,
  filterError: null,

  // 🔍 Search
  setSearchQuery: (query: string) => {
    set({
      searchQuery: query,
      filterPagination: {
        ...get().filterPagination,
        page: 1,
      },
    });
  },

  // 🧠 Payload Builder (central logic)
  buildFilterPayload: (page: number): FilterBoardsParams => {
    const { appliedFilters, searchQuery } = get();
    const location = get().getEffectiveLocation();

    const payload: FilterBoardsParams = {
      page,
      limit: 10,
      // min_price: 100,
      // max_price: 1000,
    };

    if (searchQuery.trim()) {
      payload.search = searchQuery.trim();
    }

    if (appliedFilters.size > 0) {
      payload.slugs = Array.from(appliedFilters);
    }

    if (location?.location_id) {
      payload.location_id = location.location_id;
    } else if (location?.city_id) {
      payload.city_id = location.city_id;
    }

    return payload;
  },

  // 🎯 Apply Filters
  applyFilters: async ({ page = 1 } = {}) => {
    try {
      set({ isFiltering: true, filterError: null });

      const payload = get().buildFilterPayload(page);
      console.log('[applyFilters] payload:', payload);

      const response = await fetchFilteredBoards(payload);
      console.log('[applyFilters] raw response:', response);

      const mapped = mapFilteredBoards(response);
      console.log('[applyFilters] mapped:', mapped);

      const boards = mapped?.boards ?? [];

      const total = response?.pagination?.total ?? boards.length;

      const limit = response?.pagination?.limit ?? 10;

      set(state => ({
        filteredBoards:
          page === 1 ? boards : [...state.filteredBoards, ...boards],

        filterPagination: {
          page: mapped?.page ?? 1,
          totalPages: mapped?.totalPages ?? 1,
          total,
          limit,
        },

        isFiltering: false,
      }));
    } catch (error) {
      console.error('[applyFilters] Error:', error);

      set({
        filterError: 'Unable to fetch boards.',
        isFiltering: false,
      });
    }
  },

  // 🚀 Load More (fixed, no weird slicing nonsense)
  loadMoreBoards: async () => {
    const { filterPagination, isFiltering } = get();

    if (isFiltering) return;

    const nextPage = filterPagination.page + 1;

    if (nextPage > filterPagination.totalPages) return;

    await get().applyFilters({ page: nextPage });
  },

  setAppliedFilters: async filters => {
    set({ appliedFilters: filters });
    await get().applyFilters({ page: 1 });
  },
  setAppliedFilterOrder: order => set({ appliedFilterOrder: order }),

  // 🏙️ City
  setSelectedCity: async (city: City) => {
    const currentCity = get().selectedCity;

    if (currentCity?.id === city.id) return;

    set({
      selectedCity: city,
      selectedLocation: null,
    });

    const { boardFiltersByCity, locationsByCity } = get();

    if (!boardFiltersByCity[city.id]) {
      await get().fetchBoardFilters(city.id);
    }

    if (!locationsByCity[city.id]) {
      await get().fetchLocations(city.id);
    }
  },

  // 📍 Location
  setSelectedLocation: location => {
    set({ selectedLocation: location });
  },

  // 🌆 Cities
  fetchCities: async () => {
    try {
      set({ isCitiesLoading: true, citiesError: null });

      const res = await LocationApi.getCities();
      const mapped = res.data?.map(mapCity) ?? [];

      set({
        cities: mapped,
        isCitiesLoading: false,
      });
    } catch (error) {
      set({
        citiesError: error,
        isCitiesLoading: false,
      });
    }
  },

  // 📍 Locations
  fetchLocations: async (cityId: number) => {
    try {
      set({ isLocationsLoading: true, locationsError: null });

      const res = await LocationApi.getLocations(cityId);
      const mapped = res.data?.map(mapLocation) ?? [];

      set(state => ({
        locationsByCity: {
          ...state.locationsByCity,
          [cityId]: mapped,
        },
        isLocationsLoading: false,
      }));
    } catch (error) {
      set({
        locationsError: error,
        isLocationsLoading: false,
      });
    }
  },

  // 📊 Filters
  fetchBoardFilters: async (cityId: number) => {
    try {
      set({
        isBoardFiltersLoading: true,
        boardFiltersError: null,
      });

      const data = await fetchBoardFilters(cityId);

      set(state => ({
        boardFiltersByCity: {
          ...state.boardFiltersByCity,
          [cityId]: mapFiltersResponse(data),
        },
        isBoardFiltersLoading: false,
      }));
    } catch (error) {
      set({
        boardFiltersError: error,
        isBoardFiltersLoading: false,
      });
    }
  },

  // 🎯 Selectors
  getCurrentBoardFilters: () => {
    const city = get().selectedCity;
    if (!city) return null;
    return get().boardFiltersByCity[city.id] ?? null;
  },

  getCurrentLocations: () => {
    const city = get().selectedCity;
    if (!city) return null;
    return get().locationsByCity[city.id] ?? null;
  },

  getEffectiveLocation: () => {
    const { selectedCity, selectedLocation } = get();

    if (selectedLocation) {
      return { location_id: selectedLocation.id };
    }

    if (selectedCity) {
      return { city_id: selectedCity.id };
    }

    return null;
  },

  // 🔄 Reset
  resetStore: () => {
    set({
      // selectedCity: null,
      selectedLocation: null,
      cities: [],
      locationsByCity: {},
      boardFiltersByCity: {},
      isCitiesLoading: false,
      isLocationsLoading: false,
      isBoardFiltersLoading: false,
      citiesError: null,
      locationsError: null,
      boardFiltersError: null,
      filteredBoards: [],
      appliedFilters: new Set(),
      appliedFilterOrder: [],
      searchQuery: '',
      filterPagination: { page: 1, totalPages: 1, total: 0, limit: 10 },
    });
  },
}));
