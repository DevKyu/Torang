import { ref, get, update } from 'firebase/database';
import { db, incrementPinsByEmpId } from '../services/firebase';
import type { MatchResult } from '../hooks/useMatchResult';
import type { YearMonth, MatchType } from '../types/match';
import type { Result } from './ranking';

export const applyPinChangeBatch = async (
  ym: YearMonth,
  myId: string,
  type: MatchType,
  results: MatchResult[],
  pinDelta: number = 0.5,
) => {
  const updates: Record<string, any> = {};
  const pinOps: Promise<void>[] = [];

  await Promise.all(
    results.map(async ({ opponentId, result }) => {
      const pinPath = `matchResults/${ym}/${type}/${myId}/${opponentId}/pinUpdated`;
      const pinRef = ref(db, pinPath);

      const [pinUpdatedSnap, oppPinSnap] = await Promise.all([
        get(pinRef),
        get(ref(db, `users/${opponentId}/pin`)),
      ]);

      const alreadyUpdated =
        pinUpdatedSnap.exists() && pinUpdatedSnap.val() === true;
      if (alreadyUpdated) return;

      if (result === 'win') {
        pinOps.push(incrementPinsByEmpId(myId, +pinDelta));
        const oppPin = oppPinSnap.exists() ? Number(oppPinSnap.val()) : 0;
        if (oppPin > 0) {
          pinOps.push(incrementPinsByEmpId(opponentId, -pinDelta));
        }
      }

      updates[pinPath] = true;
    }),
  );

  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }

  if (pinOps.length > 0) {
    await Promise.all(pinOps);
  }
};

export const applyPinRewardBatch = async (
  ym: YearMonth,
  myId: string,
  type: MatchType,
  opponentIds: string[],
  results: Record<string, Result>,
  allMatches: Record<string, any>,
  pinDelta: number = 0.5,
) => {
  const updates: Record<string, any> = {};
  let winCount = 0;

  for (const opponentId of opponentIds) {
    const match = allMatches[opponentId];
    if (!match) continue;

    if (match.pinUpdated) continue;

    const result = results[opponentId];
    if (result === 'win') {
      winCount++;
    }

    updates[`matchResults/${ym}/${type}/${myId}/${opponentId}/pinUpdated`] =
      true;
  }

  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }

  if (winCount > 0) {
    await incrementPinsByEmpId(myId, winCount * pinDelta);
  }
};
