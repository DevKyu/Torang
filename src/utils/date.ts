import { useUiStore } from '../stores/useUiStore';
import type { TwoDigitMonth, YearMonth } from '../types/match';

export const getTodayYmd = (d = new Date()): number => {
  return Number(
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
      d.getDate(),
    ).padStart(2, '0')}`,
  );
};

export const isBeforeOrOnActivityDate = (
  activityYmd?: string | number | null,
): boolean => {
  if (!activityYmd) return false;
  return getTodayYmd() <= Number(activityYmd);
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

export const getReadableTimestamp = (d = new Date()): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}${mm}${dd}${hh}${mi}`;
};

export const getDiffDays = (activityYmd: string): number => {
  if (!activityYmd || activityYmd.length !== 8) return Infinity;

  const today = new Date();
  const actDate = new Date(
    Number(activityYmd.slice(0, 4)),
    Number(activityYmd.slice(4, 6)) - 1,
    Number(activityYmd.slice(6, 8)),
  );

  const diffMs = today.getTime() - actDate.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
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
