import type { UserScores } from './UserInfo';

export type RankingEntry = {
  empId: string;
  name: string;
  average: number;
  games: number;
  max: number;
  scores?: UserScores;
};

export type RankingType = 'total' | 'quarter' | 'year';
