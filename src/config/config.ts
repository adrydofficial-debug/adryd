// Configuration file for API keys
// Simple and reliable configuration

// Google Maps API Key - Replace with your actual key
export const GOOGLE_MAPS_API_KEY = 'AIzaSyDxFKpnCKK97PqBiCJFlLn59AIhkP4SgA4';

// Other configuration
export const API_BASE_URL = 'https://api.example.com';
export const ENVIRONMENT = __DEV__ ? 'development' : 'production';

// Default export
const config = {
  GOOGLE_MAPS_API_KEY,
  API_BASE_URL,
  ENVIRONMENT,
};

export default config;
