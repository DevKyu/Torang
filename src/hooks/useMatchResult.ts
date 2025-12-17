import { useEffect, useState, useRef } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../services/firebase';
import { calcMatchMonthResult } from '../utils/matchResult';
import { getResultType, type Result } from '../utils/ranking';
import type { UserInfo, Year, Month } from '../types/UserInfo';
import type { YearMonth, MatchType } from '../types/match';
import { getDiffDaysServer } from '../utils/date';

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
  delta: number;
  result: Result;
  myScore: number;
  opponentScore: number;
};

export const useMatchResult = ({
  myId,
  ym,
  type,
  users,
  activityYmd,
  withinDays = 7,
}: Params) => {
  const [results, setResults] = useState<MatchResult[] | null>(null);

  const usersRef = useRef(users);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    if (!myId) {
      setResults(null);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      const activityYm = (
        activityYmd ? activityYmd.slice(0, 6) : ym
      ) as YearMonth;

      if (activityYmd) {
        const diffDays = getDiffDaysServer(activityYmd);
        if (diffDays <= 0 || diffDays > withinDays) {
          if (!cancelled) setResults([]);
          return;
        }
      }

      const path = `match/${activityYm}/${type}/${myId}`;
      const snap = await get(ref(db, path));

      if (!snap.exists()) {
        if (!cancelled) setResults([]);
        return;
      }

      const year = activityYm.slice(0, 4) as Year;
      const month = activityYm.slice(4, 6) as Month;
      const choices = snap.val() as Record<string, { chosenAt: number }>;
      const opponentIds = Object.keys(choices);

      const newResults: MatchResult[] = opponentIds
        .map((opponentId) => {
          const { opponentName, deltaAvg, myScore, opponentScore } =
            calcMatchMonthResult(
              myId,
              opponentId,
              usersRef.current,
              year,
              month,
            );

          if (
            typeof myScore !== 'number' ||
            typeof opponentScore !== 'number' ||
            typeof deltaAvg !== 'number'
          ) {
            return null;
          }

          return {
            opponentId,
            opponentName: opponentName ?? opponentId,
            delta: deltaAvg,
            result: getResultType(deltaAvg),
            myScore,
            opponentScore,
          };
        })
        .filter(Boolean) as MatchResult[];

      if (!cancelled) {
        setResults(newResults);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [myId, ym, type, activityYmd, withinDays]);

  return results;
};
