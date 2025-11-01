import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import { asYear, asMonth } from '../utils/score';
import { getResultType, type Result } from '../utils/ranking';
import type { UserInfo } from '../types/UserInfo';
import type { YearMonth, MatchType } from '../types/match';

export type Incoming = {
  name: string;
  result: Result;
  delta?: number;
};
export const useMatchIncoming = (
  ym: YearMonth,
  myId: string | null,
  type: MatchType,
  users: Record<string, UserInfo>,
  activityYmd?: string,
) => {
  const [incoming, setIncoming] = useState<Incoming[]>([]);

  useEffect(() => {
    if (!ym || !myId) return;

    const activityYm = activityYmd ? activityYmd.slice(0, 6) : ym;
    const r = ref(db, `match/${activityYm}/${type}`);
    const off = onValue(r, (snap) => {
      if (!snap.exists()) {
        setIncoming([]);
        return;
      }

      const year = asYear(activityYm.slice(0, 4));
      const month = asMonth(String(Number(activityYm.slice(4, 6))));
      const allUsers = snap.val() as Record<
        string,
        Record<string, { chosenAt: number }>
      >;

      const pickedMe: Incoming[] = [];

      for (const [empId, opponents] of Object.entries(allUsers)) {
        for (const opponentId of Object.keys(opponents)) {
          if (opponentId === myId) {
            const myScore = users[myId]?.scores?.[year]?.[month];
            const opponentScore = users[empId]?.scores?.[year]?.[month];

            let delta: number | undefined;
            if (
              typeof myScore === 'number' &&
              typeof opponentScore === 'number'
            ) {
              delta = myScore - opponentScore;
            }

            pickedMe.push({
              name: users[empId]?.name ?? empId,
              delta,
              result: getResultType(delta),
            });
          }
        }
      }

      setIncoming(pickedMe);
    });

    return () => off();
  }, [ym, myId, type, users, activityYmd]);

  return incoming;
};
