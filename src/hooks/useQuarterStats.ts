import { useMemo } from 'react';
import {
  quarters,
  calcAvg,
  getPrevQuarter,
  asYear,
  asMonth,
} from '../utils/score';
import type { Year, Month, UserScores } from '../types/UserInfo';

type Return = {
  months: readonly Month[];
  curArr: (number | undefined)[];
  avgCur: number | null;
  avgPrev: number | null;
  validCount: number;
};

export const useQuarterStats = (
  scores: UserScores,
  year: Year,
  quarter: keyof typeof quarters,
): Return => {
  const months = quarters[quarter];

  const yearScores = scores[asYear(year)] ?? {};

  return useMemo(() => {
    const curArr = months.map((m) => yearScores?.[asMonth(m)]);
    const avgCur = calcAvg(curArr);

    const prevInfo = getPrevQuarter(year, quarter);
    const prevArr = prevInfo
      ? quarters[prevInfo[1]].map(
          (m) => scores[asYear(prevInfo[0])]?.[asMonth(m)],
        )
      : [];
    const avgPrev = prevInfo ? calcAvg(prevArr) : null;

    const validCount = curArr.filter(
      (v): v is number => typeof v === 'number',
    ).length;

    return { months, curArr, avgCur, avgPrev, validCount };
  }, [months, yearScores, scores, year, quarter]);
};
