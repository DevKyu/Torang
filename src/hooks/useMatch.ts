import { useEffect, useState, useCallback } from 'react';
import { ref, onValue, runTransaction, remove } from 'firebase/database';
import { db } from '../services/firebase';
import type { YearMonth, MatchType } from '../types/match';

export type MatchChoice = { chosenAt: number, message?: string };
export type MatchChoices = Record<string, MatchChoice>;

export const useMatch = (
  ym: YearMonth,
  myId: string | null,
  type: MatchType,
  maxChoices = 1,
) => {
  const [choices, setChoices] = useState<MatchChoices>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ym || !myId) return;
    const r = ref(db, `match/${ym}/${type}/${myId}`);
    const off = onValue(r, (snap) => {
      setChoices(snap.exists() ? (snap.val() as MatchChoices) : {});
      setLoading(false);
    });
    return () => off();
  }, [ym, myId, type]);

  const select = useCallback(
    async (targetId: string, message?: string) => {
      if (!myId) return;

      const r = ref(db, `match/${ym}/${type}/${myId}`);
      await runTransaction(r, (current: MatchChoices | null) => {
        const next = current ?? {};

        if (next[targetId]) {
          return { ...next, [targetId]: { chosenAt: Date.now() } };
        }

        if (Object.keys(next).length >= maxChoices) return next;

        return {
        ...next,
        [targetId]: {
          chosenAt: Date.now(),
          ...(message ? { message } : {}),
        },
      };
      });
    },
    [ym, myId, type, maxChoices],
  );

  const clear = useCallback(
    async (targetId: string) => {
      if (!myId) return;
      await remove(ref(db, `match/${ym}/${type}/${myId}/${targetId}`));
    },
    [ym, myId, type],
  );

  return { choices, loading, select, clear, maxChoices };
};
