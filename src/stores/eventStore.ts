import { create } from 'zustand';
import { ref, get as dbGet } from 'firebase/database';
import { db } from '../services/firebase';
import { useUiStore } from './useUiStore';
import type { MatchType } from '../types/match';

export type { MatchType };

export type PinRewardConfig = {
  targetScore: number;
  rivalMatch: number;
  pinMatch: number;
  achievement: number;
  referral: number;
};

export type GalleryRewardItem = { pin: number; threshold: number };
export type GalleryRewardConfig = {
  upload: GalleryRewardItem;
  likeCreator: GalleryRewardItem;
  commentCreator: GalleryRewardItem;
};

export type MenuBadgeType = 'new' | 'soon' | 'hot';

export type MenuConfigItem = {
  order?: number;
  badge?: MenuBadgeType;
  disabled?: boolean;
  hidden?: boolean;
};

export type MenuConfig = Record<string, MenuConfigItem>;

const DEFAULT_MENU: MenuConfigItem = {
  order: 999,
  disabled: false,
};

const DEFAULT_REWARD: PinRewardConfig = {
  targetScore: 0,
  rivalMatch: 0,
  pinMatch: 0,
  achievement: 0,
  referral: 0,
};

const DEFAULT_GALLERY_REWARD: GalleryRewardConfig = {
  upload: { pin: 0, threshold: 5 },
  likeCreator: { pin: 0, threshold: 10 },
  commentCreator: { pin: 0, threshold: 5 },
};

type EventStore = {
  menu: MenuConfig;
  pinReward: Record<string, PinRewardConfig>;
  galleryReward: Record<string, GalleryRewardConfig>;
  matchType: MatchType;
  loaded: boolean;

  loadEventConfig(): Promise<void>;

  getMenuItem(id: string): MenuConfigItem;
  isMenuDisabled(id: string): boolean;

  getThisMonthPinReward(): PinRewardConfig;
  getPinRewardRate(key: keyof PinRewardConfig): number;
  isPinRewardEnabled(key: keyof PinRewardConfig): boolean;
  getGalleryReward(ym?: string): GalleryRewardConfig;
};

export const useEventStore = create<EventStore>((set, get) => ({
  menu: {},
  pinReward: {},
  galleryReward: {},
  matchType: 'rival',
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

      const rawGalleryReward = v.galleryReward ?? {};
      const normalizedGalleryReward: Record<string, GalleryRewardConfig> = {};
      Object.entries(rawGalleryReward).forEach(([ym, cfg]) => {
        normalizedGalleryReward[String(ym)] = {
          ...DEFAULT_GALLERY_REWARD,
          ...(cfg as Partial<GalleryRewardConfig>),
        };
      });

      set({
        menu: v.menu ?? {},
        pinReward: normalizedReward,
        galleryReward: normalizedGalleryReward,
        matchType: (v.matchType as MatchType) ?? 'rival',
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

  getPinRewardRate: (key) => {
    return get().getThisMonthPinReward()[key] || 0;
  },

  isPinRewardEnabled: (key) => {
    return get().getPinRewardRate(key) > 0;
  },

  getGalleryReward: (ym) => {
    const ui = useUiStore.getState();
    const key = ym ?? (ui.lastSync ? String(ui.formatServerDate('ym')) : '');
    return { ...DEFAULT_GALLERY_REWARD, ...(get().galleryReward[key] ?? {}) };
  },
}));
