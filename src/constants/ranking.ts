import type { RankingType } from '../types/ranking';

export const RANKING_TYPE_LABELS: Record<RankingType, string> = {
  total: '전체',
  quarter: '분기',
  year: '연간',
  monthly: '월간',
};

export const HEADER_TOAST_MAP: Record<
  'rank' | 'name' | 'avg' | 'best' | 'join' | 'pin' | 'league',
  (rankingTypeLabel?: string) => string
> = {
  rank: (label) => `🏅 순위 : ${label} 순위`,
  name: () => `👤 이름 : 회원 이름`,
  avg: (label) => `📊 평균 : ${label} 평균 점수`,
  best: (label) => `🔥 최고 : ${label} 최고 점수`,
  join: (label) => `🎳 참여 : ${label} 참여 경기 수`,
  pin: () => `📌 핀 : 분기 또랑핀 갯수`,
  league: () => `🏆 리그 : 소속된 리그`,
};

export const EXCLUDED_EMP_IDS = ['20160000'];
