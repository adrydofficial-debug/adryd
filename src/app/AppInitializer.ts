import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';

const AppInitializer = () => {
  const hasInitialized = useRef(false);
  const { cities, fetchCities, setSelectedCity } = useAppStore();

  useEffect(() => {
    if (hasInitialized.current) return;

    const init = async () => {
      try {
        console.log('[AppInit] Starting initialization...');

        // 1. Fetch cities
        await fetchCities();
        const freshCities = useAppStore.getState().cities;
        console.log('[AppInit] Cities loaded:', freshCities);

        if (!freshCities.length) {
          console.warn('[AppInit] No cities found. Amazing.');
          return;
        }

        // 2. Restore stored city or pick default
        const stored = await AsyncStorage.getItem('selected_city');
        let selectedCity;

        if (stored) {
          selectedCity = JSON.parse(stored);
          console.log('[AppInit] Restoring stored city:', selectedCity);
        } else {
          selectedCity =
            freshCities.find(city => city.name.toLowerCase() === 'lahore') ??
            freshCities[0];
          console.log('[AppInit] Using default city:', selectedCity);

          await AsyncStorage.setItem(
            'selected_city',
            JSON.stringify(selectedCity),
          );
        }

        await setSelectedCity(selectedCity);

        hasInitialized.current = true;
        console.log('[AppInit] Initialization complete');
      } catch (err) {
        console.error('[AppInit] Failed:', err);
      }
    };

    init();
  }, [fetchCities, setSelectedCity]);

  return null;
};

export default AppInitializer;
