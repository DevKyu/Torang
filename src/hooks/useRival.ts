import { useEffect, useState, useCallback } from 'react';
import { ref, onValue, set, remove } from 'firebase/database';
import { db } from '../services/firebase';
import type { YearMonth } from '../types/rival';

export type RivalChoice = { rivalId: string; chosenAt: number };

export const useRival = (ym: YearMonth, myId: string | null) => {
  const [choice, setChoice] = useState<RivalChoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ym || !myId) return;
    const r = ref(db, `rivals/${ym}/${myId}`);
    const off = onValue(r, (snap) => {
      setChoice(snap.exists() ? (snap.val() as RivalChoice) : null);
      setLoading(false);
    });
    return () => off();
  }, [ym, myId]);

  const select = useCallback(
    async (targetId: string) => {
      if (!myId) return;
      await set(ref(db, `rivals/${ym}/${myId}`), {
        rivalId: targetId,
        chosenAt: Date.now(),
      } satisfies RivalChoice);
    },
    [ym, myId],
  );

  const clear = useCallback(async () => {
    if (!myId) return;
    await remove(ref(db, `rivals/${ym}/${myId}`));
  }, [ym, myId]);

  return { choice, loading, select, clear };
};
