import { asYear, asMonth } from './score';
import type { UserScores } from '../types/UserInfo';

export const today = (): string => new Date().toISOString().slice(0, 10);

export const todayYm = (): string => {
  const d = new Date();
  return formatYm(d.getFullYear(), d.getMonth() + 1);
};

export const formatYm = (year: number, month: number): string =>
  `${year}${String(month).padStart(2, '0')}`;

export const findFirstParticipationYm = (scores: UserScores): string | null => {
  const years = Object.keys(scores).sort();

  for (const y of years) {
    const yearKey = asYear(y);
    const months = Object.keys(scores[yearKey] ?? {})
      .map((m) => parseInt(m, 10))
      .filter((m) => typeof scores[yearKey]?.[asMonth(String(m))] === 'number')
      .sort((a, b) => a - b);

    if (months.length > 0) {
      return `${y}${String(months[0]).padStart(2, '0')}`;
    }
  }

  return null;
};

export const findStreakYms = (
  scores: UserScores,
  streakTargets: number[],
): Record<number, string> => {
  const entries: string[] = [];

  for (const y of Object.keys(scores)) {
    const yearKey = asYear(y);
    for (const m of Object.keys(scores[yearKey] ?? {})) {
      const mKey = asMonth(m);
      if (
        typeof scores[yearKey]?.[mKey] === 'number' ||
        scores[yearKey]?.[mKey] === true
      ) {
        entries.push(`${y}${String(m).padStart(2, '0')}`);
      }
    }
  }

  if (entries.length === 0) return {};
  entries.sort();

  const achieved: Record<number, string> = {};
  let streak = 1;

  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1];
    const curr = entries[i];

    const prevYear = parseInt(prev.slice(0, 4), 10);
    const prevMonth = parseInt(prev.slice(4, 6), 10);
    const currYear = parseInt(curr.slice(0, 4), 10);
    const currMonth = parseInt(curr.slice(4, 6), 10);

    const nextYear = prevMonth === 12 ? prevYear + 1 : prevYear;
    const nextMonth = prevMonth === 12 ? 1 : prevMonth + 1;

    if (currYear === nextYear && currMonth === nextMonth) {
      streak++;
    } else {
      streak = 1;
    }

    streakTargets.forEach((target) => {
      if (streak >= target && !achieved[target]) {
        achieved[target] = curr;
      }
    });
  }

  return achieved;
};

export const findScoreStreakYm = (
  scores: Partial<Record<string, Partial<Record<string, number>>>>,
  minScore: number,
  streak: number,
): string | null => {
  const yms = Object.keys(scores)
    .flatMap((y) => Object.keys(scores[y] ?? {}).map((m) => `${y}${m}`))
    .sort((a, b) => Number(a) - Number(b));

  if (yms.length < streak) return null;

  let count = 0;

  for (const ym of yms) {
    const year = ym.slice(0, 4);
    const month = ym.slice(4);
    const score = scores[year]?.[month];

    if ((score ?? 0) >= minScore) {
      count++;
      if (count >= streak) {
        const formatted = `${year}${String(month).padStart(2, '0')}`;
        return formatted;
      }
    } else {
      count = 0;
    }
  }

  return null;
};

export const findPersonalBestYm = (
  scores: Partial<Record<string, Partial<Record<string, number>>>>,
): string | null => {
  const sorted = Object.keys(scores)
    .flatMap((y) =>
      Object.keys(scores[y] ?? {}).map((m) => ({
        year: Number(y),
        month: Number(m),
        score: scores[y]?.[m] ?? 0,
      })),
    )
    .sort((a, b) => a.year - b.year || a.month - b.month);

  if (sorted.length <= 1) return null;

  const latest = sorted[sorted.length - 1];
  const maxBefore = Math.max(...sorted.slice(0, -1).map((s) => s.score));

  return latest.score > maxBefore
    ? `${latest.year}${String(latest.month).padStart(2, '0')}`
    : null;
};
export const getActiveYm = (join: string, months: number): string => {
  const joinY = parseInt(join.slice(0, 4), 10);
  const joinM = parseInt(join.slice(4, 6), 10);

  let year = joinY;
  let month = joinM + months;

  while (month > 12) {
    year++;
    month -= 12;
  }

  return formatYm(year, month);
};

export const findScoreYms = (
  scores: UserScores,
  milestones: number[],
): Record<number, string> => {
  const achieved: Record<number, string> = {};
  const years = Object.keys(scores).sort();

  for (const y of years) {
    const yearKey = asYear(y);
    const months = Object.keys(scores[yearKey] ?? {}).sort(
      (a, b) => parseInt(a, 10) - parseInt(b, 10),
    );

    for (const m of months) {
      const mKey = asMonth(m);
      const score = scores[yearKey]?.[mKey];
      if (typeof score !== 'number') continue;

      milestones.forEach((ms) => {
        if (score >= ms && !achieved[ms]) {
          achieved[ms] = `${y}${String(m).padStart(2, '0')}`;
        }
      });
    }
  }

  return achieved;
};

export const getActiveAchievementYm = (
  joinYm: string,
  months: number,
): string | null => {
  const targetYm = getActiveYm(joinYm, months);
  return todayYm() >= targetYm ? targetYm : null;
};
