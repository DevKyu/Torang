import { ref, get, update } from 'firebase/database';
import { db, incrementPinsByEmpId } from '../services/firebase';
import type { MatchResult } from '../hooks/useMatchResult';
import type { YearMonth, MatchType } from '../types/match';
import type { Result } from './ranking';
import { showMatchWithPinToast } from './toast';

export const applyPinChangeBatch = async (
  ym: YearMonth,
  myId: string,
  type: MatchType,
  results: MatchResult[],
  pinDelta: number = 0.5,
) => {
  const updates: Record<string, any> = {};
  let gainedPins = 0;

  for (const { opponentId, opponentName, result } of results) {
    const matchPath = `matchResults/${ym}/${type}/${myId}/${opponentId}`;
    const rewardPath = `users/${myId}/rewards/${ym}/match/${opponentId}`;
    const pinUpdatedRef = ref(db, `${matchPath}/pinUpdated`);

    const [pinUpdatedSnap, oppPinSnap] = await Promise.all([
      get(pinUpdatedRef),
      get(ref(db, `users/${opponentId}/pin`)),
    ]);

    const alreadyUpdated =
      pinUpdatedSnap.exists() && pinUpdatedSnap.val() === true;
    if (alreadyUpdated) continue;

    if (result === 'win') {
      gainedPins += pinDelta;
      await incrementPinsByEmpId(myId, +pinDelta);

      if (type !== 'rival') {
        const oppPin = Number(oppPinSnap.val() ?? 0);
        if (oppPin >= pinDelta) {
          await incrementPinsByEmpId(opponentId, -pinDelta);
        }
      }

      updates[rewardPath] = {
        type,
        opponentId,
        opponentName,
        result,
        direction: result === 'win' ? 'gain' : 'loss',
        pin: pinDelta,
        ym,
        createdAt: Date.now(),
      };
    }

    updates[`${matchPath}/pinUpdated`] = true;
  }

  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }

  if (gainedPins > 0) {
    showMatchWithPinToast(gainedPins, type);
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
