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

const DEFAULT_MENU: MenuConfigItem = {
  order: 999,
  disabled: false,
};

const DEFAULT_REWARD: PinRewardConfig = {
  isTargetScore: false,
  isRivalMatch: false,
  isPinMatch: false,
  isAchievement: false,
  isGalleryUpload: false,
};

type EventStore = {
  menu: MenuConfig;
  pinReward: Record<string, PinRewardConfig>;
  loaded: boolean;

  loadEventConfig(): Promise<void>;

  getMenuItem(id: string): MenuConfigItem;
  isMenuDisabled(id: string): boolean;

  getThisMonthPinReward(): PinRewardConfig;
  isPinRewardEnabled(key: keyof PinRewardConfig): boolean;
};

export const useEventStore = create<EventStore>((set, get) => ({
  menu: {},
  pinReward: {},
  loaded: false,

  loadEventConfig: async () => {
    try {
      const snap = await dbGet(ref(db, 'eventConfig'));
      const v = snap.exists() ? snap.val() : {};

      const rawReward = v.pinReward ?? {};
      const normalizedReward: Record<string, PinRewardConfig> = {};

      Object.entries(rawReward).forEach(([ym, cfg]) => {
        normalizedReward[String(ym)] = {
          ...DEFAULT_REWARD,
          ...(cfg as Partial<PinRewardConfig>),
        };
      });

      set({
        menu: v.menu ?? {},
        pinReward: normalizedReward,
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  getMenuItem: (id) => {
    return { ...DEFAULT_MENU, ...(get().menu[id] ?? {}) };
  },

  isMenuDisabled: (id) => {
    return get().getMenuItem(id).disabled ?? false;
  },

  getThisMonthPinReward: () => {
    const ui = useUiStore.getState();
    if (!ui.lastSync) return DEFAULT_REWARD;

    const ym = String(ui.formatServerDate('ym'));
    return { ...DEFAULT_REWARD, ...(get().pinReward[ym] ?? {}) };
  },

  isPinRewardEnabled: (key) => {
    return get().getThisMonthPinReward()[key];
  },
}));
