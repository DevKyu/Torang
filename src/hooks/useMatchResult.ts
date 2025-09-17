import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db, saveMatchResult } from '../services/firebase';
import { calcMatchMonthResult } from '../utils/matchResult';
import { getResultType, type Result } from '../utils/ranking';
import type { UserInfo, Year, Month } from '../types/UserInfo';
import type { YearMonth, MatchType } from '../types/match';

type Params = {
  myId: string | null;
  ym: YearMonth;
  type: MatchType;
  users: Record<string, UserInfo>;
  activityYmd?: string;
  withinDays?: number;
};

export type MatchResult = {
  opponentId: string;
  opponentName: string;
  delta?: number;
  result: Result;
};

export const useMatchResult = ({
  myId,
  ym,
  type,
  users,
  activityYmd,
  withinDays = 7,
}: Params) => {
  const [results, setResults] = useState<MatchResult[]>([]);

  useEffect(() => {
    if (!ym || !myId || !activityYmd) return;

    const r = ref(db, `match/${ym}/${type}/${myId}`);
    const off = onValue(r, async (snap) => {
      if (!snap.exists()) {
        setResults([]);
        return;
      }

      const today = new Date();
      const todayYmd = Number(
        `${today.getFullYear()}${String(today.getMonth() + 1).padStart(
          2,
          '0',
        )}${String(today.getDate()).padStart(2, '0')}`,
      );
      const diffDays = todayYmd - Number(activityYmd);
      if (diffDays < 0 || diffDays > withinDays) {
        setResults([]);
        return;
      }

      const year = ym.slice(0, 4) as Year;
      const month = ym.slice(4, 6) as Month;
      const choices = snap.val() as Record<string, { chosenAt: number }>;

      const newResults: MatchResult[] = [];

      for (const opponentId of Object.keys(choices)) {
        const { opponentName, deltaAvg, myScore, opponentScore } =
          calcMatchMonthResult(myId, opponentId, users, year, month);

        const result = getResultType(deltaAvg);

        newResults.push({
          opponentId,
          opponentName: opponentName ?? opponentId,
          delta: deltaAvg,
          result,
        });

        if (
          myId &&
          typeof myScore === 'number' &&
          typeof opponentScore === 'number' &&
          typeof deltaAvg === 'number'
        ) {
          await saveMatchResult(
            ym,
            myId,
            type,
            opponentId,
            myScore,
            opponentScore,
            deltaAvg,
            result,
          );
        }
      }

      setResults(newResults);
    });

    return () => off();
  }, [myId, ym, type, users, activityYmd, withinDays]);

  return results;
};
