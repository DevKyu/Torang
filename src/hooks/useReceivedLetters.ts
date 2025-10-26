import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import type { YearMonth, MatchType } from '../types/match';

type MatchData = Record<
  string,
  Record<string, { chosenAt: number; message?: string; anonymous?: boolean }>
>;

type ReceivedLetter = {
  fromId: string;
  message: string;
  anonymous?: boolean;
  chosenAt: number;
};

export const useReceivedLetters = (
  ym: YearMonth,
  myId: string | null,
  type: MatchType,
) => {
  const [letters, setLetters] = useState<ReceivedLetter[]>([]);

  useEffect(() => {
    if (!myId) return;

    const rootRef = ref(db, `match/${ym}/${type}`);
    const off = onValue(rootRef, (snap) => {
      if (!snap.exists()) {
        setLetters([]);
        return;
      }

      const data = snap.val() as MatchData;
      const results: ReceivedLetter[] = [];

      Object.entries(data).forEach(([senderId, targets]) => {
        if (targets && myId in targets) {
          const target = targets[myId];
          results.push({
            fromId: senderId,
            message: target.message ?? '',
            anonymous: target.anonymous ?? false,
            chosenAt: target.chosenAt,
          });
        }
      });

      results.sort((a, b) => b.chosenAt - a.chosenAt);
      setLetters(results);
    });

    return () => off();
  }, [ym, myId, type]);

  return letters;
};
