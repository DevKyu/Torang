import { useUiStore } from '../stores/useUiStore';
import type { TwoDigitMonth, YearMonth } from '../types/match';
import type { ActivityDateAll } from '../services/firebase';

export const getTodayYmd = (d = new Date()): number => {
  return Number(
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
      d.getDate(),
    ).padStart(2, '0')}`,
  );
};

export const isBeforeOrOnActivityDate = (
  activityYmd?: string | number | null,
  date?: Date,
): boolean => {
  if (!activityYmd) return false;
  return getTodayYmd(date) <= Number(activityYmd);
};
export const getYearMonth = (d = new Date()): YearMonth => {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0') as TwoDigitMonth;
  return `${y}${m}`;
};

export const getQuarterEndYm = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const quarter = Math.floor((month - 1) / 3) + 1;
  const endMonth = quarter * 3;
  return `${year}${String(endMonth).padStart(2, '0')}`;
};

export const getQuarterStartYm = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const quarter = Math.floor((month - 1) / 3) + 1;
  const startMonth = quarter * 3 - 2;
  return `${year}${String(startMonth).padStart(2, '0')}`;
};

export const getPrevYm = (ym: string): string => {
  const year = Number(ym.slice(0, 4));
  const month = Number(ym.slice(4));
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}${String(prevMonth).padStart(2, '0')}`;
};

export const getDiffDaysServer = (activityYmd: string): number => {
  if (!activityYmd || activityYmd.length !== 8) return Infinity;

  const { getServerNow } = useUiStore.getState();
  const serverNow = getServerNow();

  const actDate = new Date(
    Number(activityYmd.slice(0, 4)),
    Number(activityYmd.slice(4, 6)) - 1,
    Number(activityYmd.slice(6, 8)),
  );

  const diffMs = serverNow.getTime() - actDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

export const resolveActivityYmd = (
  activityAll: ActivityDateAll,
  serverYear: string,
  serverMonth: number,
): string | undefined => {
  let activityYmd = activityAll[serverYear]?.[String(serverMonth)];
  if (!activityYmd) {
    const prevMonth = serverMonth === 1 ? 12 : serverMonth - 1;
    const prevYear =
      serverMonth === 1 ? Number(serverYear) - 1 : Number(serverYear);
    activityYmd = activityAll[String(prevYear)]?.[String(prevMonth)];
  }
  return activityYmd ? String(activityYmd) : undefined;
};

export const isWithinActivityDays = (
  activityYmd?: string | null,
  withinDays = 7,
): boolean => {
  if (!activityYmd) return false;

  const diffDays = getDiffDaysServer(activityYmd);
  return diffDays >= 0 && diffDays <= withinDays;
};

export const createAdminMonthOptions = (): string[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const result: string[] = [];

  for (let y = 2025; y <= currentYear; y++) {
    const startMonth = y === 2025 ? 9 : 1;
    const endMonth = y === currentYear ? currentMonth : 12;

    for (let m = startMonth; m <= endMonth; m++) {
      result.push(`${y}${String(m).padStart(2, '0')}`);
    }
  }

  return result.reverse();
};
