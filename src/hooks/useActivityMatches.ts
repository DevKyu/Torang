import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db, auth, empIdFromEmail, preloadAllNames, getCachedUserName } from '../services/firebase';
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
  rival: { win: '라이벌 매치 승리', lose: '라이벌 매치 패배', draw: '라이벌 매치 무승부', none: '라이벌 매치' },
  pin:   { win: '핀 매치 승리',    lose: '핀 매치 패배',    draw: '핀 매치 무승부',    none: '핀 매치' },
};

const fallbackDate = (yyyymm: string): number =>
  new Date(`${yyyymm.slice(0, 4)}-${yyyymm.slice(4, 6)}-01`).getTime();

const toMatchItem = (
  type: MatchType,
  myId: string,
  opponentId: string,
  entry: MatchResult,
  yyyymm: string,
): ActivityItem => ({
  id: `match_${type}_${opponentId}`,
  type: 'match',
  date: typeof entry.finalizedAt === 'number' ? entry.finalizedAt : fallbackDate(yyyymm),
  title: TITLE[type][entry.result] ?? TITLE[type].none,
  delta: typeof entry.delta === 'number' ? entry.delta : entry.myScore - entry.opponentScore,
  teams: {
    my: [getCachedUserName(myId)],
    opponent: [getCachedUserName(opponentId)],
  },
  scores: { my: entry.myScore, opponent: entry.opponentScore },
});

export const useActivityMatches = (yyyymm: string) => {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const myId = empIdFromEmail(auth.currentUser?.email);
    if (!myId) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        await preloadAllNames();

        const [rivalSnap, pinSnap] = await Promise.all([
          get(ref(db, `matchResults/${yyyymm}/rival/${myId}`)),
          get(ref(db, `matchResults/${yyyymm}/pin/${myId}`)),
        ]);

        if (cancelled) return;

        const result: ActivityItem[] = [];

        if (rivalSnap.exists()) {
          const entries = rivalSnap.val() as Record<string, MatchResult>;
          for (const [opponentId, entry] of Object.entries(entries)) {
            result.push(toMatchItem('rival', myId, opponentId, entry, yyyymm));
          }
        }

        if (pinSnap.exists()) {
          const entries = pinSnap.val() as Record<string, MatchResult>;
          for (const [opponentId, entry] of Object.entries(entries)) {
            result.push(toMatchItem('pin', myId, opponentId, entry, yyyymm));
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
    })();

    return () => {
      cancelled = true;
    };
  }, [yyyymm]);

  return { items, loading };
};
