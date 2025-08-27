import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import type { YearMonth } from '../types/rival';
import type { UserInfo } from '../types/UserInfo';
import { asYear, asMonth } from '../utils/score';
import { getResultType, type Result } from '../utils/ranking';

export type RivalIncomingResult = {
  fromId: string;
  chosenAt: number;
  result: Result;
  delta?: number;
};

export const useRivalIncoming = (
  ym: YearMonth,
  myId: string | null,
  users: Record<string, UserInfo>,
) => {
  const [incoming, setIncoming] = useState<RivalIncomingResult[]>([]);

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

      const data = snap.val() as Record<
        string,
        { rivalId: string; chosenAt: number }
      >;

      const pickedMe = Object.entries(data)
        .filter(([_, choice]) => choice.rivalId === myId)
        .map(([empId, choice]) => {
          const meScore = users[myId]?.scores?.[year]?.[month];
          const rivalScore = users[empId]?.scores?.[year]?.[month];

          let delta: number | undefined;
          if (typeof meScore === 'number' && typeof rivalScore === 'number') {
            delta = meScore - rivalScore;
          }

          return {
            fromId: empId,
            chosenAt: choice.chosenAt,
            delta,
            result: getResultType(delta),
          };
        });

      setIncoming(pickedMe);
    });

    return () => off();
  }, [ym, myId, users]);

  return incoming;
};
