import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../services/firebase';
import type { YearMonth, MatchType } from '../types/match';

type MatchData = Record<
  string,
  Record<string, { chosenAt: number; message?: string; anonymous?: boolean }>
>;

export type ReceivedLetter = {
  fromId: string;
  message: string;
  anonymous?: boolean;
  chosenAt: number;
};

export const useReceivedLetters = (
  ym: YearMonth,
  myId: string | null,
  type: MatchType,
  activityYmd?: string,
) => {
  const [letters, setLetters] = useState<ReceivedLetter[]>([]);

  useEffect(() => {
    if (!myId) return;

    const activityYm = activityYmd?.slice(0, 6) ?? ym;
    const rootRef = ref(db, `match/${activityYm}/${type}`);

    const unsubscribe = onValue(rootRef, (snap) => {
      if (!snap.exists()) {
        setLetters([]);
        return;
      }

      const data = snap.val() as MatchData;
      const results: ReceivedLetter[] = [];

      for (const [senderId, targets] of Object.entries(data)) {
        const target = targets?.[myId];
        if (!target) continue;

        results.push({
          fromId: senderId,
          message: target.message ?? '',
          anonymous: target.anonymous ?? false,
          chosenAt: target.chosenAt,
        });
      }

      results.sort((a, b) => b.chosenAt - a.chosenAt);
      setLetters(results);
    });

    return () => off(rootRef, 'value', unsubscribe);
  }, [ym, myId, type, activityYmd]);

  return letters;
};
