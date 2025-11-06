// import { createStore } from 'zustand';
// import { useStore } from 'zustand';

// export const useCityStore = () => useStore(cityStore);
// type CityState = {
//   selectedCity: string | null;
//   setSelectedCity: (city: string) => void;
// };

// // Create the store
// const cityStore = createStore<CityState>((set) => ({
//   selectedCity: null,
//   setSelectedCity: (city) => set({ selectedCity: city }),
// }));




import { create } from 'zustand';

type CityState = {
  selectedCity: string | null;
  setSelectedCity: (city: string) => void;
};

// Create the store
export const useCityStore = create<CityState>((set) => ({
  selectedCity: null,
  setSelectedCity: (city) => set({ selectedCity: city }),
}));
