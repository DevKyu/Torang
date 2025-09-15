import { useEffect, useState, useCallback } from 'react';
import { ref, onValue, runTransaction, remove } from 'firebase/database';
import { db } from '../services/firebase';
import type { YearMonth } from '../types/rival';

export type RivalChoice = { chosenAt: number };
export type RivalChoices = Record<string, RivalChoice>;

export const useRival = (
  ym: YearMonth,
  myId: string | null,
  maxChoices = 1,
) => {
  const [choices, setChoices] = useState<RivalChoices>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ym || !myId) return;
    const r = ref(db, `rivals/${ym}/${myId}`);
    const off = onValue(r, (snap) => {
      setChoices(snap.exists() ? (snap.val() as RivalChoices) : {});
      setLoading(false);
    });
    return () => off();
  }, [ym, myId]);

  const select = useCallback(
    async (targetId: string) => {
      if (!myId) return;
      const r = ref(db, `rivals/${ym}/${myId}`);
      await runTransaction(r, (current: RivalChoices | null) => {
        const next = current ?? {};
        const count = Object.keys(next).length;
        if (maxChoices === 1) {
          return { [targetId]: { chosenAt: Date.now() } };
        }
        if (count >= maxChoices && !next[targetId]) {
          return next;
        }
        return { ...next, [targetId]: { chosenAt: Date.now() } };
      });
    },
    [ym, myId, maxChoices],
  );

  const clear = useCallback(
    async (targetId: string) => {
      if (!myId) return;
      await remove(ref(db, `rivals/${ym}/${myId}/${targetId}`));
    },
    [ym, myId],
  );

  return { choices, loading, select, clear, maxChoices };
};
