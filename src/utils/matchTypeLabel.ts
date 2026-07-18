import type { MatchType } from '../types/match';

export const getMatchTypeNouns = (matchType: MatchType) => ({
  labelNoun: matchType === 'pin' ? '핀 쟁탈전 매치' : '라이벌 매치',
  descNoun: matchType === 'pin' ? '핀 매치' : '라이벌 매치',
});
