import { useEffect, useMemo, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import { asYear, asMonth } from '../utils/score';
import { getResultType, type Result } from '../utils/ranking';
import type { UserInfo } from '../types/UserInfo';
import type { YearMonth, MatchType } from '../types/match';
import type { ReceivedLetter } from './useReceivedLetters';

export type Incoming = {
  name: string;
  result: Result;
  delta?: number;
};

type RawMatchData = Record<
  string,
  Record<string, { chosenAt: number; message?: string; anonymous?: boolean }>
>;

export const useMatchIncomingAndLetters = (
  ym: YearMonth,
  myId: string | null,
  type: MatchType,
  users: Record<string, UserInfo>,
  activityYmd?: string,
) => {
  const [matchData, setMatchData] = useState<RawMatchData | null>(null);

  useEffect(() => {
    if (!myId) {
      setMatchData(null);
      return;
    }
    const activityYm = activityYmd?.slice(0, 6) ?? ym;
    const r = ref(db, `match/${activityYm}/${type}`);
    const unsub = onValue(r, (snap) => {
      setMatchData(snap.exists() ? (snap.val() as RawMatchData) : null);
    });
    return () => unsub();
  }, [ym, myId, type, activityYmd]);

  const incoming = useMemo((): Incoming[] => {
    if (!matchData || !myId) return [];
    const activityYm = activityYmd?.slice(0, 6) ?? ym;
    const year = asYear(activityYm.slice(0, 4));
    const month = asMonth(String(Number(activityYm.slice(4, 6))));
    const pickedMe: Incoming[] = [];
    for (const [empId, opponents] of Object.entries(matchData)) {
      for (const opponentId of Object.keys(opponents)) {
        if (opponentId === myId) {
          const myScore = users[myId]?.scores?.[year]?.[month];
          const opponentScore = users[empId]?.scores?.[year]?.[month];
          let delta: number | undefined;
          if (typeof myScore === 'number' && typeof opponentScore === 'number') {
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
    return pickedMe;
  }, [matchData, myId, ym, activityYmd, users]);

  const letters = useMemo((): ReceivedLetter[] => {
    if (!matchData || !myId) return [];
    const results: ReceivedLetter[] = [];
    for (const [senderId, targets] of Object.entries(matchData)) {
      const target = targets?.[myId];
      if (!target) continue;
      results.push({
        fromId: senderId,
        message: target.message ?? '',
        anonymous: target.anonymous ?? false,
        chosenAt: target.chosenAt,
      });
    }
    return results.sort((a, b) => b.chosenAt - a.chosenAt);
  }, [matchData, myId]);

  return { incoming, letters };
};
