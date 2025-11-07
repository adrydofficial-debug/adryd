// src/features/advertisments/hooks/useCampaign.ts
import { useCampaignStore, CompanyData, AdvertisementData } from '../../../store/campaignStore';

/**
 * Hook to manage campaign data (company + advertisement)
 * This hook provides easy access to the campaign store
 */
export const useCampaign = () => {
  const companyData = useCampaignStore((state) => state.companyData);
  const advertisementData = useCampaignStore((state) => state.advertisementData);
  const setCompanyData = useCampaignStore((state) => state.setCompanyData);
  const setAdvertisementData = useCampaignStore((state) => state.setAdvertisementData);
  const clearCampaignData = useCampaignStore((state) => state.clearCampaignData);
  const clearCompanyData = useCampaignStore((state) => state.clearCompanyData);
  const clearAdvertisementData = useCampaignStore((state) => state.clearAdvertisementData);

  return {
    companyData,
    advertisementData,
    setCompanyData,
    setAdvertisementData,
    clearCampaignData,
    clearCompanyData,
    clearAdvertisementData,
    hasCompanyData: companyData !== null,
    hasAdvertisementData: advertisementData !== null,
    hasCompleteData: companyData !== null && advertisementData !== null,
  };
};

