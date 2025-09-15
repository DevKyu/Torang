import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import type { YearMonth } from '../types/rival';
import type { UserInfo } from '../types/UserInfo';
import { asYear, asMonth } from '../utils/score';
import { getResultType, type Result } from '../utils/ranking';

export type Incoming = {
  name: string;
  result: Result;
  delta?: number;
};

export const useRivalIncoming = (
  ym: YearMonth,
  myId: string | null,
  users: Record<string, UserInfo>,
) => {
  const [incoming, setIncoming] = useState<Incoming[]>([]);

  useEffect(() => {
    if (!ym || !myId) return;

    const r = ref(db, `rivals/${ym}`);
    const off = onValue(r, (snap) => {
      if (!snap.exists()) {
        setIncoming([]);
        return;
      }

      const year = asYear(ym.slice(0, 4));
      const month = asMonth(String(Number(ym.slice(4, 6))));

      const allUsers = snap.val() as Record<
        string,
        Record<string, { chosenAt: number }>
      >;

      const pickedMe: Incoming[] = [];

      for (const [empId, rivals] of Object.entries(allUsers)) {
        for (const [rivalId] of Object.entries(rivals)) {
          if (rivalId === myId) {
            const meScore = users[myId]?.scores?.[year]?.[month];
            const rivalScore = users[empId]?.scores?.[year]?.[month];

            let delta: number | undefined;
            if (typeof meScore === 'number' && typeof rivalScore === 'number') {
              delta = meScore - rivalScore;
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
  }, [ym, myId, users]);

  return incoming;
};
