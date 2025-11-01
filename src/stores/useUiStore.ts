import { create } from 'zustand';
import { ref, get } from 'firebase/database';
import { db } from '../services/firebase';

type UiState = {
  hasShownCongrats: {
    myInfo: boolean;
    ranking: boolean;
  };
  serverOffset: number;
  serverDate: Date;
  lastSync: number | null;
  syncServerTime: () => Promise<void>;
  getServerNow: () => Date;
  formatServerDate: (
    type?: 'year' | 'month' | 'ym' | 'ymd' | 'ymdhm' | 'hm',
  ) => string;
  isBeforeCutoff: (activityYmd?: string, cutoffTime?: string) => boolean;
  getServerTimestamp: () => string;
  setShownCongrats: (menu: 'myInfo' | 'ranking') => void;
  resetShownCongrats: (menu: 'myInfo' | 'ranking') => void;
};

const getServerTimeOffset = async (): Promise<number> => {
  try {
    const snap = await get(ref(db, '.info/serverTimeOffset'));
    return snap.exists() ? (snap.val() as number) : 0;
  } catch {
    return 0;
  }
};

export const useUiStore = create<UiState>((set, get) => ({
  hasShownCongrats: {
    myInfo: false,
    ranking: false,
  },
  serverOffset: 0,
  serverDate: new Date(),
  lastSync: null,

  syncServerTime: async () => {
    const offset = await getServerTimeOffset();
    const serverNow = new Date(Date.now() + offset);
    set({
      serverOffset: offset,
      serverDate: serverNow,
      lastSync: Date.now(),
    });
  },

  getServerNow: () => {
    const offset = get().serverOffset;
    return new Date(Date.now() + offset);
  },

  formatServerDate: (type = 'ymd') => {
    const d = get().getServerNow();
    const y = d.getFullYear();
    const mNum = d.getMonth() + 1;
    const m = String(mNum);
    const mm = String(mNum).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');

    switch (type) {
      case 'year':
        return String(y);
      case 'month':
        return m;
      case 'ym':
        return `${y}${m}`;
      case 'ymd':
        return `${y}${mm}${day}`;
      case 'ymdhm':
        return `${y}${mm}${day}${h}${min}`;
      case 'hm':
        return `${h}${min}`;
      default:
        return `${y}${mm}${day}`;
    }
  },

  isBeforeCutoff: (activityYmd, cutoffTime = '18:30') => {
    if (!activityYmd || activityYmd.length !== 8) return false;
    const base = get().getServerNow();
    const actDate = new Date(
      Number(activityYmd.slice(0, 4)),
      Number(activityYmd.slice(4, 6)) - 1,
      Number(activityYmd.slice(6, 8)),
    );
    const [hStr, mStr] = cutoffTime.split(':');
    const hour = Number(hStr);
    const minute = Number(mStr);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return false;
    const cutoff = new Date(actDate).setHours(hour, minute, 0, 0);
    return base.getTime() <= cutoff;
  },

  getServerTimestamp: () => get().formatServerDate('ymdhm'),

  setShownCongrats: (menu) =>
    set((state) => ({
      hasShownCongrats: { ...state.hasShownCongrats, [menu]: true },
    })),

  resetShownCongrats: (menu) =>
    set((state) => ({
      hasShownCongrats: { ...state.hasShownCongrats, [menu]: false },
    })),
}));
