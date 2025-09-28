import { create } from 'zustand';

type UiState = {
  hasShownCongrats: {
    myInfo: boolean;
    ranking: boolean;
  };
  setShownCongrats: (menu: 'myInfo' | 'ranking') => void;
  resetShownCongrats: (menu: 'myInfo' | 'ranking') => void;
};

export const useUiStore = create<UiState>((set) => ({
  hasShownCongrats: {
    myInfo: false,
    ranking: false,
  },
  setShownCongrats: (menu) =>
    set((state) => ({
      hasShownCongrats: { ...state.hasShownCongrats, [menu]: true },
    })),
  resetShownCongrats: (menu) =>
    set((state) => ({
      hasShownCongrats: { ...state.hasShownCongrats, [menu]: false },
    })),
}));
