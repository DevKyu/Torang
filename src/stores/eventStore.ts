import { create } from 'zustand';
import { ref, get as dbGet } from 'firebase/database';
import { db } from '../services/firebase';
import { useUiStore } from './useUiStore';

export type PinRewardConfig = {
  isTargetScore: boolean;
  isRivalMatch: boolean;
  isPinMatch: boolean;
  isAchievement: boolean;
  isGalleryUpload: boolean;
};

export type MenuBadgeType = 'new' | 'soon' | 'hot';

export type MenuConfigItem = {
  order?: number;
  badge?: MenuBadgeType;
  disabled?: boolean;
};

export type MenuConfig = Record<string, MenuConfigItem>;

type EventStore = {
  menu: MenuConfig;
  pinReward: Record<string, PinRewardConfig>;
  loaded: boolean;

  loadEventConfig: () => Promise<void>;
  getThisMonthPinReward: () => PinRewardConfig;
};

const EMPTY_REWARD: PinRewardConfig = {
  isTargetScore: false,
  isRivalMatch: false,
  isPinMatch: false,
  isAchievement: false,
  isGalleryUpload: false,
};

export const useEventStore = create<EventStore>((set, getState) => ({
  menu: {},
  pinReward: {},
  loaded: false,

  loadEventConfig: async () => {
    if (getState().loaded) return;

    try {
      const snap = await dbGet(ref(db, 'eventConfig'));

      const v = snap.exists() ? (snap.val() as any) : {};

      set({
        menu: v.menu ?? {},
        pinReward: v.pinReward ?? {},
        loaded: true,
      });
    } catch (e) {
      console.error('loadEventConfig failed:', e);
      set({ loaded: true });
    }
  },

  getThisMonthPinReward: () => {
    const ui = useUiStore.getState();
    if (!ui.lastSync) return EMPTY_REWARD;

    const ym = ui.formatServerDate('ym');
    return getState().pinReward[ym] ?? EMPTY_REWARD;
  },
}));
