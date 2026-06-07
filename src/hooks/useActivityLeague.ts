import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, empIdFromEmail } from '../services/firebase';
import type { ActivityItem, LeaguePlayer } from '../types/activity';

export type RawGroup = {
  winner: 'team1' | 'team2' | 'draw';
  date: number;
  team1?: Record<string, { name: string; score1: number; score2: number }>;
  team2?: Record<string, { name: string; score1: number; score2: number }>;
};

const toPlayers = (raw?: Record<string, { name: string; score1: number; score2: number }>): LeaguePlayer[] =>
  raw
    ? Object.entries(raw)
        .map(([empId, p]) => ({ empId, name: p.name, scores: [p.score1 ?? 0, p.score2 ?? 0] as [number, number] }))
        .sort((a, b) => b.scores[1] - a.scores[1])
    : [];

export const useActivityLeague = (ym: string) => {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();

      const empId = empIdFromEmail(user?.email);
      if (!empId) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const [statusSnap, snap] = await Promise.all([
          get(ref(db, `teamFormation/${ym}/status`)),
          get(ref(db, `team/${ym}`)),
        ]);
        if (cancelled) return;

        const isConfirmed = !statusSnap.exists() || statusSnap.val() === 'confirmed';
        if (!isConfirmed || !snap.exists()) {
          setItems([]);
          setLoading(false);
          return;
        }

        const data = snap.val() as Record<string, RawGroup>;
        const result: ActivityItem[] = [];

        for (const [groupId, group] of Object.entries(data)) {
          const team1Players = toPlayers(group.team1);
          const team2Players = toPlayers(group.team2);

          let myTeamNum: 'team1' | 'team2' | null = null;
          if (team1Players.some((p) => p.empId === empId)) myTeamNum = 'team1';
          else if (team2Players.some((p) => p.empId === empId)) myTeamNum = 'team2';
          if (!myTeamNum) continue;

          const myTeam = myTeamNum === 'team1' ? team1Players : team2Players;
          const opponentTeam = myTeamNum === 'team1' ? team2Players : team1Players;

          let leagueResult: 'win' | 'lose' | 'draw';
          if (group.winner === 'draw') leagueResult = 'draw';
          else leagueResult = group.winner === myTeamNum ? 'win' : 'lose';

          let date: number;
          if (group.date) {
            const n = group.date;
            const y = Math.floor(n / 10000);
            const m = Math.floor((n % 10000) / 100) - 1;
            const d = n % 100;
            date = new Date(y, m, d).getTime();
          } else {
            date = new Date(`${ym.slice(0, 4)}-${ym.slice(4)}-01`).getTime();
          }

          result.push({
            id: `league_${ym}_${groupId}`,
            type: 'league',
            date,
            title: `${groupId}조 정기전`,
            group: groupId,
            result: leagueResult,
            myTeamNum,
            myTeam,
            myTotalScore: myTeam.reduce((s, p) => s + p.scores[1], 0),
            opponentTeam,
            opponentTotalScore: opponentTeam.reduce((s, p) => s + p.scores[1], 0),
          });
        }

        if (!cancelled) {
          setItems(result);
          setLoading(false);
        }
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
