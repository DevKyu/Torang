import { ref, update } from 'firebase/database';
import { db, incrementPinsByEmpId } from '../services/firebase';
import type { Result } from './ranking';
import type { YearMonth, MatchType } from '../types/match';

export const applyPinChangeBatch = async (
  ym: YearMonth,
  myId: string,
  type: MatchType,
  opponentIds: string[],
  results: Record<string, Result>,
  allMatches: Record<string, any>,
  pinDelta: number = 0.5,
) => {
  const updates: Record<string, any> = {};
  const pinOps: Promise<void>[] = [];

  for (const opponentId of opponentIds) {
    const match = allMatches[opponentId];
    if (!match) continue;

    if (match.pinUpdated) continue;

    const result = results[opponentId];
    if (result === 'win') {
      pinOps.push(incrementPinsByEmpId(myId, +pinDelta));
      pinOps.push(incrementPinsByEmpId(opponentId, -pinDelta));
    }

    updates[`matchResults/${ym}/${type}/${myId}/${opponentId}/pinUpdated`] =
      true;
  }

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
