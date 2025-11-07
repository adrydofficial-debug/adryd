// src/store/campaignStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --------------------
// Types
// --------------------
export interface CompanyData {
  companyName: string;
  businessName: string;
  businessCategory: string;
  companyEmail: string;
  companyAddress: string;
  companyNTN: string;
  companyNumber?: string;
  logoUri?: string;
  logoType?: string;
  logoName?: string;
}

export interface AdvertisementData {
  campaignName: string;
  description: string;
  location: string;
  selectedDays: (Date | string)[]; // Can be Date or ISO string after persistence
  startDate: Date | string; // Can be Date or ISO string after persistence
  endDate: Date | string; // Can be Date or ISO string after persistence
  category?: string;
  totalPayment?: number;
  tax?: number;
}

export interface CampaignState {
  companyData: CompanyData | null;
  advertisementData: AdvertisementData | null;
  selectedDays: (Date | string)[]; // Selected dates in calendar (current user)
  globalSelectedDates: (Date | string)[]; // All selected dates from all users (marked as booked)
  
  // Actions
  setCompanyData: (data: CompanyData) => void;
  setAdvertisementData: (data: AdvertisementData) => void;
  setSelectedDays: (days: (Date | string)[]) => void;
  addGlobalSelectedDate: (date: Date | string) => void;
  addGlobalSelectedDates: (dates: (Date | string)[]) => void;
  removeGlobalSelectedDate: (date: Date | string) => void;
  clearGlobalSelectedDates: () => void;
  clearCampaignData: () => void;
  clearCompanyData: () => void;
  clearAdvertisementData: () => void;
  clearSelectedDays: () => void;
}

// --------------------
// Store
// --------------------
// Helper function to normalize date to ISO string
const normalizeDate = (date: Date | string): string => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
  }
  // If it's already a string, try to parse it
  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return date; // Return as-is if can't parse
};

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      companyData: null,
      advertisementData: null,
      selectedDays: [],
      globalSelectedDates: [], // Store for dates selected by any user (marked as booked)

      setCompanyData: (data: CompanyData) => {
        set({ companyData: data });
        console.log('✅ Company data saved to store:', data);
      },

      setAdvertisementData: (data: AdvertisementData) => {
        set({ advertisementData: data });
        console.log('✅ Advertisement data saved to store:', data);
      },

      setSelectedDays: (days: (Date | string)[]) => {
        // Convert Date objects to ISO strings for persistence
        const serializedDays = days.map(day => 
          day instanceof Date ? day.toISOString() : day
        );
        set({ selectedDays: serializedDays });
        console.log('✅ Selected days saved to store:', serializedDays.length, 'days');
      },

      // Add a single date to global selected dates (marked as booked for all users)
      addGlobalSelectedDate: (date: Date | string) => {
        const normalized = normalizeDate(date);
        const current = get().globalSelectedDates.map(normalizeDate);
        if (!current.includes(normalized)) {
          const updated = [...get().globalSelectedDates, normalized];
          set({ globalSelectedDates: updated });
          console.log('📅 Added date to global selected dates (booked for all users):', normalized);
        }
      },

      // Add multiple dates to global selected dates
      addGlobalSelectedDates: (dates: (Date | string)[]) => {
        const normalizedNew = dates.map(normalizeDate);
        const current = get().globalSelectedDates.map(normalizeDate);
        const unique = new Set([...current, ...normalizedNew]);
        const updated = Array.from(unique);
        set({ globalSelectedDates: updated });
        console.log('📅 Added', dates.length, 'dates to global selected dates (booked for all users)');
      },

      // Remove a date from global selected dates
      removeGlobalSelectedDate: (date: Date | string) => {
        const normalized = normalizeDate(date);
        const current = get().globalSelectedDates.map(normalizeDate);
        const updated = current.filter(d => d !== normalized);
        set({ globalSelectedDates: updated });
        console.log('📅 Removed date from global selected dates:', normalized);
      },

      // Clear all global selected dates
      clearGlobalSelectedDates: () => {
        set({ globalSelectedDates: [] });
        console.log('✅ Global selected dates cleared from store');
      },

      clearCampaignData: () => {
        set({ companyData: null, advertisementData: null, selectedDays: [] });
        console.log('✅ Campaign data cleared from store');
      },

      clearCompanyData: () => {
        set({ companyData: null });
        console.log('✅ Company data cleared from store');
      },

      clearAdvertisementData: () => {
        set({ advertisementData: null });
        console.log('✅ Advertisement data cleared from store');
      },

      clearSelectedDays: () => {
        set({ selectedDays: [] });
        console.log('✅ Selected days cleared from store');
      },
    }),
    {
      name: 'campaign-storage', // key in AsyncStorage
      partialize: (state) => ({
        // Only persist the data, not the functions
        companyData: state.companyData,
        advertisementData: state.advertisementData,
        selectedDays: state.selectedDays,
        globalSelectedDates: state.globalSelectedDates, // Persist global selected dates
      }),
    },
  ),
);

