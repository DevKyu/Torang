import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import {
  db,
  auth,
  empIdFromEmail,
  preloadAllNames,
  getCachedUserName,
} from '../services/firebase';
import type { ActivityItem } from '../types/activity';
import type { MatchType } from '../types/match';

type MatchResult = {
  myScore: number;
  opponentScore: number;
  delta: number;
  result: 'win' | 'lose' | 'draw' | 'none';
  finalizedAt?: number;
};

const TITLE: Record<MatchType, Record<string, string>> = {
  rival: {
    win: '라이벌 매치 승리',
    lose: '라이벌 매치 패배',
    draw: '라이벌 매치 무승부',
    none: '라이벌 매치',
  },
  pin: {
    win: '핀 쟁탈전 승리',
    lose: '핀 쟁탈전 패배',
    draw: '핀 쟁탈전 무승부',
    none: '핀 쟁탈전',
  },
};

const fallbackDate = (ym: string): number =>
  new Date(`${ym.slice(0, 4)}-${ym.slice(4, 6)}-01`).getTime();

const toMatchItem = (
  type: MatchType,
  myId: string,
  opponentId: string,
  entry: MatchResult,
  ym: string,
): ActivityItem => ({
  id: `match_${type}_${opponentId}`,
  type: 'match',
  date:
    typeof entry.finalizedAt === 'number'
      ? entry.finalizedAt
      : fallbackDate(ym),
  title: TITLE[type][entry.result] ?? TITLE[type].none,
  delta:
    typeof entry.delta === 'number'
      ? entry.delta
      : entry.myScore - entry.opponentScore,
  teams: {
    my: [getCachedUserName(myId)],
    opponent: [getCachedUserName(opponentId)],
  },
  scores: { my: entry.myScore, opponent: entry.opponentScore },
});

export const useActivityMatches = (ym: string) => {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      const myId = empIdFromEmail(user?.email);
      if (!myId) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const [, rivalSnap, pinSnap] = await Promise.all([
          preloadAllNames(),
          get(ref(db, `matchResults/${ym}/rival/${myId}`)),
          get(ref(db, `matchResults/${ym}/pin/${myId}`)),
        ]);

        if (cancelled) return;

        const result: ActivityItem[] = [];

        if (rivalSnap.exists()) {
          const entries = rivalSnap.val() as Record<string, MatchResult>;
          for (const [opponentId, entry] of Object.entries(entries)) {
            result.push(toMatchItem('rival', myId, opponentId, entry, ym));
          }
        }

        if (pinSnap.exists()) {
          const entries = pinSnap.val() as Record<string, MatchResult>;
          for (const [opponentId, entry] of Object.entries(entries)) {
            result.push(toMatchItem('pin', myId, opponentId, entry, ym));
          }
        }

        setItems(result);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [ym]);

  return { items, loading };
};
