import type { RankingType } from '../types/Ranking';

export const RANKING_TYPE_LABELS: Record<RankingType, string> = {
  total: '전체',
  quarter: '분기',
  year: '연간',
};

export const HEADER_TOAST_MAP: Record<
  'rank' | 'name' | 'avg' | 'best' | 'join',
  (rankingTypeLabel?: string) => string
> = {
  rank: (label) => `🏅 순위 : ${label} 순위`,
  name: () => `👤 이름 : 회원 이름`,
  avg: (label) => `📊 평균 : ${label} 평균 점수`,
  best: (label) => `🔥 최고 : ${label} 최고 점수`,
  join: (label) => `🎳 참여 : ${label} 참여 경기 수`,
};

export const EXCLUDED_EMP_IDS = ['20160000'];
