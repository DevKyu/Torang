import type { Month, UserScores } from '../types/UserInfo';
import { useUiStore } from '../stores/useUiStore';
import { asYear, normalizeMonth } from './score';

export const today = (): string =>
  useUiStore.getState().getServerNow().toISOString().slice(0, 10);

export const todayYm = (): string =>
  useUiStore.getState().formatServerDate('ym');

export const formatYm = (year: number, month: number): string =>
  `${year}${String(month).padStart(2, '0')}`;

export const findFirstParticipationYm = (scores: UserScores): string | null => {
  const years = Object.keys(scores).sort((a, b) => Number(a) - Number(b));

  for (const y of years) {
    const yearScores = scores[asYear(y)];
    if (!yearScores) continue;

    const months = Object.keys(yearScores)
      .map(normalizeMonth)
      .filter((m): m is Month => !!m && typeof yearScores[m] === 'number')
      .sort((a, b) => Number(a) - Number(b));

    if (months.length) return formatYm(Number(y), Number(months[0]));
  }

  return null;
};

export const findStreakYms = (
  scores: UserScores,
  streakTargets: number[],
): Record<number, string> => {
  const entries: number[] = [];

  for (const y of Object.keys(scores)) {
    const yearScores = scores[asYear(y)];
    if (!yearScores) continue;

    for (const m of Object.keys(yearScores)) {
      const mKey = normalizeMonth(m);
      if (!mKey) continue;

      const v = yearScores[mKey];
      if (typeof v === 'number' || v === true) {
        entries.push(Number(`${y}${String(mKey).padStart(2, '0')}`));
      }
    }
  }

  if (!entries.length) return {};

  entries.sort((a, b) => a - b);

  const achieved: Record<number, string> = {};
  let streak = 1;

  for (let i = 1; i < entries.length; i++) {
    const [py, pm] = [Math.floor(entries[i - 1] / 100), entries[i - 1] % 100];
    const [cy, cm] = [Math.floor(entries[i] / 100), entries[i] % 100];

    const isNext =
      (pm === 12 && cy === py + 1 && cm === 1) ||
      (pm !== 12 && cy === py && cm === pm + 1);

    streak = isNext ? streak + 1 : 1;

    for (const t of streakTargets) {
      if (streak >= t && !achieved[t]) achieved[t] = String(entries[i]);
    }
  }

  return achieved;
};

export const findAfterPartyStreakYms = (
  participation: Record<string, Record<string, boolean>>,
  streakTargets: number[],
): Record<number, string> => {
  const entries = Object.entries(participation)
    .flatMap(([y, months]) =>
      Object.keys(months)
        .map(normalizeMonth)
        .filter((m): m is Month => !!m)
        .map((m) => Number(`${y}${String(m).padStart(2, '0')}`)),
    )
    .sort((a, b) => a - b);

  if (!entries.length) return {};

  const achieved: Record<number, string> = {};
  let streak = 1;

  for (let i = 1; i < entries.length; i++) {
    const [py, pm] = [Math.floor(entries[i - 1] / 100), entries[i - 1] % 100];
    const [cy, cm] = [Math.floor(entries[i] / 100), entries[i] % 100];

    const isNext =
      (pm === 12 && cy === py + 1 && cm === 1) ||
      (pm !== 12 && cy === py && cm === pm + 1);

    streak = isNext ? streak + 1 : 1;

    for (const t of streakTargets) {
      if (streak === t && !achieved[t]) achieved[t] = String(entries[i]);
    }
  }

  return achieved;
};

export const findScoreStreakYm = (
  scores: Partial<Record<string, Partial<Record<string, number>>>>,
  minScore: number,
  streak: number,
): string | null => {
  const entries = Object.entries(scores)
    .flatMap(([y, months]) =>
      Object.entries(months ?? {})
        .map(([m, v]) => {
          const mKey = normalizeMonth(m);
          return typeof v === 'number' && mKey
            ? Number(`${y}${String(mKey).padStart(2, '0')}`)
            : null;
        })
        .filter((v): v is number => v !== null),
    )
    .sort((a, b) => a - b);

  let count = 0;

  for (const ym of entries) {
    const y = String(Math.floor(ym / 100));
    const m = String(ym % 100) as Month;
    const score = scores[y]?.[m];

    if ((score ?? 0) >= minScore) {
      if (++count >= streak) return formatYm(Number(y), Number(m));
    } else {
      count = 0;
    }
  }

  return null;
};

export const findPersonalBestYm = (
  scores: Partial<Record<string, Partial<Record<string, number>>>>,
): string | null => {
  const list = Object.entries(scores)
    .flatMap(([y, months]) =>
      Object.entries(months ?? {}).map(([m, s]) => ({
        y: Number(y),
        m: Number(m),
        s: s ?? 0,
      })),
    )
    .sort((a, b) => a.y - b.y || a.m - b.m);

  if (list.length <= 1) return null;

  const last = list[list.length - 1];
  const prevMax = Math.max(...list.slice(0, -1).map((v) => v.s));

  return last.s > prevMax ? formatYm(last.y, last.m) : null;
};

export const findScoreYms = (
  scores: UserScores,
  milestones: number[],
): Record<number, string> => {
  const achieved: Record<number, string> = {};

  for (const y of Object.keys(scores).sort((a, b) => Number(a) - Number(b))) {
    const yearScores = scores[asYear(y)];
    if (!yearScores) continue;

    const months = Object.keys(yearScores)
      .map(normalizeMonth)
      .filter((m): m is Month => !!m && typeof yearScores[m] === 'number')
      .sort((a, b) => Number(a) - Number(b));

    for (const m of months) {
      const score = yearScores[m]!;
      for (const ms of milestones) {
        if (score >= ms && !achieved[ms]) {
          achieved[ms] = formatYm(Number(y), Number(m));
        }
      }
    }
  }

  return achieved;
};

export const getActiveYm = (join: string, months: number): string => {
  let y = +join.slice(0, 4);
  let m = +join.slice(4, 6) + months;

  while (m > 12) {
    y++;
    m -= 12;
  }

  return formatYm(y, m);
};

export const getActiveAchievementYm = (
  joinYm: string,
  months: number,
): string | null => {
  const today = useUiStore.getState().formatServerDate('ym');
  const target = getActiveYm(joinYm, months);
  return today >= target ? target : null;
};
