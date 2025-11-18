// src/store/drawerStore.ts
import { create } from 'zustand';

interface DrawerState {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

export const useDrawerStore = create<DrawerState>(set => ({
  isVisible: false,
  setIsVisible: (visible: boolean) => set({ isVisible: visible }),
}));
