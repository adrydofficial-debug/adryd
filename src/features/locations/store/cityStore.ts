// store/cityStore.ts
import { create } from 'zustand';
import { City } from '../domain/entities';

interface CityStore {
  selectedCity: City | null;
  setSelectedCity: (city: City) => void;
  clearSelectedCity: () => void;
}

export const useCityStore = create<CityStore>(set => ({
  selectedCity: null,
  setSelectedCity: city => set({ selectedCity: city }),
  clearSelectedCity: () => set({ selectedCity: null }),
}));
