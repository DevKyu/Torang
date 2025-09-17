import type { RankingEntry } from '../types/Ranking';
import type { UserInfo, Year, Month } from '../types/UserInfo';

export const calcRankingResult = (
  myId: string | null,
  opponentId: string | null,
  ranking: RankingEntry[] | undefined,
) => {
  if (!myId || !opponentId || !ranking) {
    return { name: undefined, deltaAvg: undefined };
  }

  const me = ranking.find((r) => r.empId === myId);
  const opponent = ranking.find((r) => r.empId === opponentId);
  if (!me || !opponent) return { name: undefined, deltaAvg: undefined };

  return {
    name: opponent.name,
    deltaAvg: Math.round(me.average - opponent.average),
  };
};

export const calcMatchMonthResult = (
  myId: string | null,
  opponentId: string | null,
  users: Record<string, UserInfo>,
  year: Year,
  month: Month,
) => {
  if (!myId || !opponentId) {
    return { opponentName: undefined, deltaAvg: undefined };
  }

  const me = users[myId];
  const opponent = users[opponentId];
  if (!me || !opponent) {
    return { opponentName: opponentId, deltaAvg: undefined };
  }

  const normalizedMonth = String(Number(month)) as Month;

  const myScore = me.scores?.[year]?.[normalizedMonth];
  const opponentScore = opponent.scores?.[year]?.[normalizedMonth];

  if (typeof myScore !== 'number' || typeof opponentScore !== 'number') {
    return { opponentName: opponent.name, deltaAvg: undefined };
  }

  return {
    opponentName: opponent.name,
    deltaAvg: myScore - opponentScore,
    myScore,
    opponentScore,
  };
};
