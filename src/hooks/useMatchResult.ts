import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db, saveMatchResult, getUserMatchResults } from '../services/firebase';
import { calcMatchMonthResult } from '../utils/matchResult';
import { getResultType, type Result } from '../utils/ranking';
import { applyPinChangeBatch } from '../utils/pin';
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
    const fetchData = async () => {
      if (!ym || !myId || !activityYmd) return;

      const snap = await get(ref(db, `match/${ym}/${type}/${myId}`));
      if (!snap.exists()) {
        setResults([]);
        return;
      }

      const today = new Date();
      const todayYmd = Number(
        `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(
          today.getDate(),
        ).padStart(2, '0')}`,
      );
      const diffDays = todayYmd - Number(activityYmd);
      if (diffDays <= 0 || diffDays > withinDays) {
        setResults([]);
        return;
      }

      const year = ym.slice(0, 4) as Year;
      const month = ym.slice(4, 6) as Month;
      const choices = snap.val() as Record<string, { chosenAt: number }>;
      const opponentIds = Object.keys(choices);

      const allMatchesByType = await getUserMatchResults(ym);
      const allMatches = allMatchesByType[type] ?? {};

      const newResults: MatchResult[] = [];
      const resultsMap: Record<string, Result> = {};

      for (const opponentId of opponentIds) {
        const { opponentName, deltaAvg, myScore, opponentScore } =
          calcMatchMonthResult(myId, opponentId, users, year, month);

        const result = getResultType(deltaAvg);
        resultsMap[opponentId] = result;

        newResults.push({
          opponentId,
          opponentName: opponentName ?? opponentId,
          delta: deltaAvg,
          result,
        });

        if (
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

      await applyPinChangeBatch(
        ym,
        myId,
        type,
        opponentIds,
        resultsMap,
        allMatches,
      );

      setResults(newResults);
    };

    fetchData();
  }, [myId, ym, type, users, activityYmd, withinDays]);

  return results;
};
