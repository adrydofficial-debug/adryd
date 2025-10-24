// Configuration file for API keys
// Simple and reliable configuration

// Google Maps API Key - Replace with your actual key
export const GOOGLE_MAPS_API_KEY = 'AIzaSyDxFKpnCKK97PqBiCJFlLn59AIhkP4SgA4';

// Supabase Configuration
export const SUPABASE_URL = 'https://buvxunjakqrunlneauwk.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dnh1bmpha3FydW5sbmVhdXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NDk4ODEsImV4cCI6MjA3NTMyNTg4MX0.fWrm84_wyFtVxq4sXlr5ZYwErAX4hakNkle5wneg2aE';

// Other configuration
export const API_BASE_URL = 'https://api.example.com';
export const ENVIRONMENT = __DEV__ ? 'development' : 'production';

// Default export
const config = {
  GOOGLE_MAPS_API_KEY,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  API_BASE_URL,
  ENVIRONMENT,
};

export default config;
