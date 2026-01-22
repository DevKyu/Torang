import type { Month, Year, UserScores, UserInfo } from '../types/UserInfo';
import type { RankingEntry, RankingType } from '../types/Ranking';
import { useUiStore } from '../stores/useUiStore';
import { getRecent3MonthScores } from './score';

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
  if (!scores) return { average: 0, games: 0, max: 0 };

  if (type === 'monthly') {
    const recent = getRecent3MonthScores(scores);
    const games = recent.length;
    const total = recent.reduce((a, b) => a + b, 0);
    const max = games ? Math.max(...recent) : 0;
    const average = games ? Math.round(total / games) : 0;
    return { average, games, max };
  }

  const { getServerNow } = useUiStore.getState();
  const now = getServerNow();

  const currentYear = String(now.getFullYear()) as Year;
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const quarterMonths = QUARTER_MONTHS_MAP[currentQuarter] ?? [];

  let total = 0;
  let games = 0;
  let max = 0;

  for (const y of Object.keys(scores)) {
    const year = y as Year;
    const yearScores = scores[year];
    if (!yearScores) continue;

    for (const m of Object.keys(yearScores)) {
      const month = m as Month;
      const score = yearScores[month];
      if (typeof score !== 'number') continue;

      const isQuarter =
        type === 'quarter' &&
        year === currentYear &&
        quarterMonths.includes(month);

      const isYear = type === 'year' && year === currentYear;

      if (type === 'total' || isQuarter || isYear) {
        total += score;
        games++;
        if (score > max) max = score;
      }
    }
  }

  const average = games ? Math.round(total / games) : 0;
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
  const leagueCount = Math.ceil(total / 6);
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
