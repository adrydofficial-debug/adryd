// src/store/drawerStore.ts
import { create } from 'zustand';

interface DrawerState {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  navigatedFromDrawer: boolean;
  setNavigatedFromDrawer: (value: boolean) => void;
  reopenDrawerCallback: (() => void) | null;
  setReopenDrawerCallback: (callback: (() => void) | null) => void;
}

export const useDrawerStore = create<DrawerState>(set => ({
  isVisible: false,
  setIsVisible: (visible: boolean) => set({ isVisible: visible }),
  navigatedFromDrawer: false,
  setNavigatedFromDrawer: (value: boolean) => set({ navigatedFromDrawer: value }),
  reopenDrawerCallback: null,
  setReopenDrawerCallback: (callback: (() => void) | null) => set({ reopenDrawerCallback: callback }),
}));
