import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import { calcRivalMonthResult } from '../utils/rivalResult';
import { getResultType, type Result } from '../utils/ranking';
import type { UserInfo, Year, Month } from '../types/UserInfo';
import type { YearMonth } from '../types/rival';

type Params = {
  myId: string | null;
  ym: YearMonth;
  users: Record<string, UserInfo>;
  activityYmd?: string;
  withinDays?: number;
};

export type RivalResult = {
  rivalId: string;
  rivalName: string;
  delta?: number;
  result: Result;
};

export const useRivalResult = ({
  myId,
  ym,
  users,
  activityYmd,
  withinDays = 7,
}: Params) => {
  const [results, setResults] = useState<RivalResult[]>([]);

  useEffect(() => {
    if (!ym || !myId || !activityYmd) return;

    const r = ref(db, `rivals/${ym}/${myId}`);
    const off = onValue(r, (snap) => {
      if (!snap.exists()) {
        setResults([]);
        return;
      }

      const today = new Date();
      const todayYmdNum = Number(
        `${today.getFullYear()}${String(today.getMonth() + 1).padStart(
          2,
          '0',
        )}${String(today.getDate()).padStart(2, '0')}`,
      );
      const diffDays = todayYmdNum - Number(activityYmd);

      if (diffDays < 0 || diffDays > withinDays) {
        setResults([]);
        return;
      }

      const year = ym.slice(0, 4) as Year;
      const month = ym.slice(4, 6) as Month;

      const rivalChoices = snap.val() as Record<string, { chosenAt: number }>;

      const newResults: RivalResult[] = [];

      for (const rivalId of Object.keys(rivalChoices)) {
        const { rivalName, deltaAvg } = calcRivalMonthResult(
          myId,
          rivalId,
          users,
          year,
          month,
        );
        newResults.push({
          rivalId,
          rivalName: rivalName ?? rivalId,
          delta: deltaAvg,
          result: getResultType(deltaAvg),
        });
      }
      setResults(newResults);
    });

    return () => off();
  }, [myId, ym, users, activityYmd, withinDays]);

  return results;
};
