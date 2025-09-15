import type { UserScores } from './UserInfo';

export type RankingEntry = {
  empId: string;
  name: string;
  average: number;
  max: number;
  games: number;
  pin: number;
  scores?: UserScores;
  league: string;
};

export type RankingType = 'total' | 'quarter' | 'year' | 'monthly';
