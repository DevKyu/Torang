import type { Month, Year, UserScores, UserInfo } from '../types/UserInfo';
import type { RankingEntry } from '../types/Ranking';

const QUARTER_MONTHS_MAP: Record<number, string[]> = {
  1: ['1', '2', '3'],
  2: ['4', '5', '6'],
  3: ['7', '8', '9'],
  4: ['10', '11', '12'],
};

export const calculateScoreStats = (
  scores: UserScores | undefined,
  type: 'total' | 'quarter' | 'year',
) => {
  let total = 0,
    games = 0,
    max = 0;

  if (!scores) return { average: 0, games: 0, max: 0 };

  const now = new Date();
  const currentYear = String(now.getFullYear());
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const quarterMonths = QUARTER_MONTHS_MAP[currentQuarter] ?? [];

  for (const year in scores) {
    const yearScores = scores[year as Year];
    if (!yearScores) continue;

    for (const month in yearScores) {
      const score = yearScores[month as Month];
      if (typeof score !== 'number') continue;

      const isInQuarter =
        type === 'quarter' &&
        year === currentYear &&
        quarterMonths.includes(month);
      const isInYear = type === 'year' && year === currentYear;

      if (type === 'total' || isInQuarter || isInYear) {
        total += score;
        games++;
        if (score > max) max = score;
      }
    }
  }

  const average = games > 0 ? Math.round(total / games) : 0;
  return { average, games, max };
};

export const sortByAvgThenGamesThenMax = (
  a: RankingEntry,
  b: RankingEntry,
): number => {
  if (b.average !== a.average) return b.average - a.average;
  if (b.games !== a.games) return b.games - a.games;
  return b.max - a.max;
};

export const mapUsersToRankingEntries = (
  users: Record<string, UserInfo>,
  type: 'total' | 'quarter' | 'year',
): RankingEntry[] => {
  return Object.entries(users)
    .map(([empId, user]) => {
      const { average, games, max } = calculateScoreStats(user.scores, type);
      return {
        empId,
        name: user.name,
        average,
        games,
        max,
        scores: user.scores,
      };
    })
    .filter((entry) => entry.games > 0)
    .sort(sortByAvgThenGamesThenMax);
};

export type Result = 'win' | 'lose' | 'draw' | 'none';

export const getResultType = (delta?: number): Result => {
  if (typeof delta !== 'number') return 'none';
  if (delta > 0) return 'win';
  if (delta < 0) return 'lose';
  return 'draw';
};
