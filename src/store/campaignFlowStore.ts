// Campaign Flow Store - Manages the flow from board selection to campaign creation
import { create } from 'zustand';

// Types
interface BoardData {
  id: string;
  title?: string;
  description?: string;
  location?: any;
  size?: string;
  width?: number;
  height?: number;
  category?: any;
  image_url?: string;
  image?: any;
  media?: any[];
  price?: number;
  currency?: string;
  rating?: number;
  area?: string;
  [key: string]: any;
}

interface Company {
  id: string | number;
  name?: string;
  company_name?: string;
  logo?: any;
  logo_url?: string;
  color?: string;
  business?: string;
  category?: any;
  ntn?: string;
  company_ntn?: string;
  address?: string;
  email?: string;
  number?: string;
  contact_number?: string;
  location?: string;
  [key: string]: any;
}

type FlowChoice = 'individual' | 'business' | null;

interface CampaignFlowState {
  selectedBoard: BoardData | null;
  
  selectedChoice: FlowChoice;
  
  companiesList: Company[];
  
  selectedCompany: Company | null;
  
  setSelectedBoard: (board: BoardData | null) => void;
  setSelectedChoice: (choice: FlowChoice) => void;
  setCompaniesList: (companies: Company[]) => void;
  setSelectedCompany: (company: Company | null) => void;
  
  resetCampaignFlow: () => void;
  
  getFlowState: () => {
    selectedBoard: BoardData | null;
    selectedChoice: FlowChoice;
    companiesList: Company[];
    selectedCompany: Company | null;
  };
}

const initialState = {
  selectedBoard: null,
  selectedChoice: null,
  companiesList: [],
  selectedCompany: null,
};

export const useCampaignFlowStore = create<CampaignFlowState>((set, get) => ({
  ...initialState,
  
  setSelectedBoard: (board) => {
    console.log('[CampaignFlowStore] Setting selected board:', board?.title || board?.id);
    set({ selectedBoard: board });
  },
  
  setSelectedChoice: (choice) => {
    console.log('[CampaignFlowStore] Setting selected choice:', choice);
    set({ selectedChoice: choice });
  },
  
  setCompaniesList: (companies) => {
    console.log('[CampaignFlowStore] Setting companies list, count:', companies.length);
    set({ companiesList: companies });
  },
  
  setSelectedCompany: (company) => {
    console.log('[CampaignFlowStore] Setting selected company:', company?.name || company?.company_name);
    set({ selectedCompany: company });
  },
  
  resetCampaignFlow: () => {
    console.log('[CampaignFlowStore] Resetting campaign flow');
    set(initialState);
  },
  
  getFlowState: () => {
    const state = get();
    return {
      selectedBoard: state.selectedBoard,
      selectedChoice: state.selectedChoice,
      companiesList: state.companiesList,
      selectedCompany: state.selectedCompany,
    };
  },
}));

export type { BoardData, Company, FlowChoice };

