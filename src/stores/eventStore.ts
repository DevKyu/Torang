import { create } from 'zustand';
import { ref, onValue, type DataSnapshot } from 'firebase/database';
import { db } from '../services/firebase';
import { useUiStore } from './useUiStore';
import type { MatchType } from '../types/match';

export type { MatchType };

const getConnectedValue = (path: string) =>
  new Promise<DataSnapshot>((resolve, reject) => {
    const unsub = onValue(
      ref(db, path),
      (snap) => {
        unsub();
        resolve(snap);
      },
      (err) => {
        unsub();
        reject(err);
      },
    );
  });

export type PinRewardConfig = {
  targetScore: number;
  rivalMatch: number;
  pinMatch: number;
  achievement: number;
};

export type GalleryRewardItem = { pin: number; threshold: number };
export type GalleryRewardConfig = {
  upload: GalleryRewardItem;
  likeCreator: GalleryRewardItem;
  commentCreator: GalleryRewardItem;
};

export type MenuBadgeConfig = {
  text: string;
  color: string;
};

export const DEFAULT_BADGE_COLOR = '#f97316';

export type MenuConfigItem = {
  order?: number;
  badge?: MenuBadgeConfig;
  disabled?: boolean;
  hidden?: boolean;
};

export type MenuConfig = Record<string, MenuConfigItem>;

const LEGACY_BADGE_PRESET: Record<string, MenuBadgeConfig> = {
  new: { text: 'NEW', color: DEFAULT_BADGE_COLOR },
  hot: { text: 'HOT', color: '#ef4444' },
  soon: { text: 'SOON', color: '#2563eb' },
};

export const normalizeMenuConfig = (raw: Record<string, unknown>): MenuConfig => {
  const out: MenuConfig = {};
  Object.entries(raw ?? {}).forEach(([id, value]) => {
    const cfg = { ...(value as MenuConfigItem) };
    const rawBadge = (value as { badge?: unknown } | undefined)?.badge;

    if (typeof rawBadge === 'string' && LEGACY_BADGE_PRESET[rawBadge]) {
      cfg.badge = LEGACY_BADGE_PRESET[rawBadge];
    } else if (rawBadge && typeof rawBadge === 'object') {
      const b = rawBadge as Partial<MenuBadgeConfig>;
      if (b.text) {
        cfg.badge = { text: String(b.text), color: b.color ?? DEFAULT_BADGE_COLOR };
      } else {
        delete cfg.badge;
      }
    } else {
      delete cfg.badge;
    }

    out[id] = cfg;
  });
  return out;
};

const DEFAULT_MENU: MenuConfigItem = {
  order: 999,
  disabled: false,
};

export const DEFAULT_MENU_DISABLED: Record<string, boolean> = {
  reward: true,
};

const DEFAULT_REWARD: PinRewardConfig = {
  targetScore: 0,
  rivalMatch: 0,
  pinMatch: 0,
  achievement: 0,
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
  referralPin: number;
  checklistReminderDays: number;
  postActivityChecklistDays: number;
  loaded: boolean;

  loadEventConfig(): Promise<void>;

  getMenuItem(id: string): MenuConfigItem;
  isMenuBlocked(id: string): boolean;

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
  referralPin: 0,
  checklistReminderDays: 0,
  postActivityChecklistDays: 0,
  loaded: false,

  loadEventConfig: async () => {
    try {
      const snap = await getConnectedValue('eventConfig');
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
        menu: normalizeMenuConfig(v.menu ?? {}),
        pinReward: normalizedReward,
        galleryReward: normalizedGalleryReward,
        matchType: (v.matchType as MatchType) ?? 'rival',
        referralPin: typeof v.referralPin === 'number' ? v.referralPin : 0,
        checklistReminderDays:
          typeof v.checklistReminderDays === 'number'
            ? v.checklistReminderDays
            : 0,
        postActivityChecklistDays:
          typeof v.postActivityChecklistDays === 'number'
            ? v.postActivityChecklistDays
            : 0,
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  getMenuItem: (id) => {
    const cfg = get().menu[id] ?? {};
    const disabled =
      cfg.disabled !== undefined
        ? cfg.disabled
        : (DEFAULT_MENU_DISABLED[id] ?? DEFAULT_MENU.disabled);
    return { ...DEFAULT_MENU, ...cfg, disabled };
  },

  isMenuBlocked: (id) => {
    const item = get().getMenuItem(id);
    return !!(item.hidden || item.disabled);
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
