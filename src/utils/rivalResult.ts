import type { RankingEntry } from '../types/Ranking';
import type { UserInfo, Year, Month } from '../types/UserInfo';

export const calcRivalResult = (
  myId: string | null,
  rivalId: string | null,
  ranking: RankingEntry[],
) => {
  if (!myId || !rivalId) return { rivalName: undefined, deltaAvg: undefined };

  const me = ranking.find((r) => r.empId === myId);
  const rival = ranking.find((r) => r.empId === rivalId);
  if (!me || !rival) return { rivalName: undefined, deltaAvg: undefined };

  const delta = Number((me.average - rival.average).toFixed(1));
  return { rivalName: rival.name, deltaAvg: delta };
};

export const calcRivalMonthResult = (
  myId: string | null,
  rivalId: string | null,
  users: Record<string, UserInfo>,
  year: Year,
  month: Month,
) => {
  if (!myId || !rivalId) return { rivalName: undefined, deltaAvg: undefined };

  const me = users[myId];
  const rival = users[rivalId];
  if (!me || !rival) return { rivalName: undefined, deltaAvg: undefined };

  const normalizedMonth = String(Number(month)) as Month;
  const myScore = me.scores?.[year]?.[normalizedMonth];
  const rivalScore = rival.scores?.[year]?.[normalizedMonth];

  if (myScore == null || rivalScore == null) {
    return { rivalName: rival.name, deltaAvg: undefined };
  }

  const delta = Number(myScore - rivalScore);
  return { rivalName: rival.name, deltaAvg: delta };
};
