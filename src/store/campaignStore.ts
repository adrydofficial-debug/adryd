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
  
  // Actions
  setCompanyData: (data: CompanyData) => void;
  setAdvertisementData: (data: AdvertisementData) => void;
  clearCampaignData: () => void;
  clearCompanyData: () => void;
  clearAdvertisementData: () => void;
}

// --------------------
// Store
// --------------------
export const useCampaignStore = create<CampaignState>()(
  persist(
    (set) => ({
      companyData: null,
      advertisementData: null,

      setCompanyData: (data: CompanyData) => {
        set({ companyData: data });
        console.log('✅ Company data saved to store:', data);
      },

      setAdvertisementData: (data: AdvertisementData) => {
        set({ advertisementData: data });
        console.log('✅ Advertisement data saved to store:', data);
      },

      clearCampaignData: () => {
        set({ companyData: null, advertisementData: null });
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
    }),
    {
      name: 'campaign-storage', // key in AsyncStorage
      partialize: (state) => ({
        // Only persist the data, not the functions
        companyData: state.companyData,
        advertisementData: state.advertisementData,
      }),
    },
  ),
);

