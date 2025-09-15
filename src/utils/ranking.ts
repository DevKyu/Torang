import type { Month, Year, UserScores, UserInfo } from '../types/UserInfo';
import type { RankingEntry, RankingType } from '../types/Ranking';

const QUARTER_MONTHS_MAP: Record<number, Month[]> = {
  1: ['1', '2', '3'],
  2: ['4', '5', '6'],
  3: ['7', '8', '9'],
  4: ['10', '11', '12'],
};

export const calculateScoreStats = (
  scores: UserScores | undefined,
  type: RankingType,
): { average: number; games: number; max: number } => {
  let total = 0;
  let games = 0;
  let max = 0;

  if (!scores) return { average: 0, games: 0, max: 0 };

  const now = new Date();
  const currentYear = String(now.getFullYear()) as Year;
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const quarterMonths = QUARTER_MONTHS_MAP[currentQuarter] ?? [];

  for (const year in scores) {
    const yearScores = scores[year as Year];
    if (!yearScores) continue;

    for (const monthKey in yearScores) {
      const score = yearScores[monthKey as Month];
      if (typeof score !== 'number') continue;

      const isInQuarter =
        type === 'quarter' &&
        year === currentYear &&
        quarterMonths.includes(monthKey as Month);

      const isInYear = type === 'year' && year === currentYear;

      if (type === 'total' || isInQuarter || isInYear || type === 'monthly') {
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
  type: RankingType,
  empIds?: string[],
): RankingEntry[] => {
  const sorted = Object.entries(users)
    .filter(([empId]) => !empIds || empIds.includes(empId))
    .map(([empId, user]) => {
      const { average, games, max } = calculateScoreStats(user.scores, type);

      return {
        empId,
        name: user.name,
        average,
        games,
        max,
        pin: user.pin ?? 0,
        scores: user.scores,
        league: '',
      };
    })
    .filter((entry) => (type === 'monthly' ? true : entry.games > 0))
    .sort((a, b) => sortByAvgThenGamesThenMax(a, b));

  if (sorted.length === 0) return [];

  const total = sorted.length;
  const leagueCount = Math.ceil(total / 4);
  const leagueSize = Math.ceil(total / leagueCount);

  return sorted.map((entry, idx) => {
    const leagueNum = Math.floor(idx / leagueSize) + 1;
    return { ...entry, league: `${leagueNum}부` };
  });
};

export type Result = 'win' | 'lose' | 'draw' | 'none';

export const getResultType = (delta?: number): Result => {
  if (typeof delta !== 'number') return 'none';
  if (delta > 0) return 'win';
  if (delta < 0) return 'lose';
  return 'draw';
};
