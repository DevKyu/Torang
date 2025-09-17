import { create } from 'zustand';

type UiState = {
  hasShownCongrats: boolean;
  setShownCongrats: () => void;
  resetShownCongrats: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  hasShownCongrats: false,
  setShownCongrats: () => set({ hasShownCongrats: true }),
  resetShownCongrats: () => set({ hasShownCongrats: false }),
}));
