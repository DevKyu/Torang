import { ref, get, update, increment } from 'firebase/database';
import {
  db,
  getCurrentUserId,
  incrementPinsByEmpId,
} from '../services/firebase';
import type { MatchResult } from '../hooks/useMatchResult';
import type { YearMonth, MatchType } from '../types/match';
import type { Result } from './ranking';
import { showMatchWithPinToast } from './toast';
import { getReadableTimestamp } from './date';
import { useUiStore } from '../stores/useUiStore';

export const applyPinChangeBatch = async (
  ym: YearMonth,
  myId: string,
  type: MatchType,
  results: MatchResult[],
  pinDelta: number = 0.5,
) => {
  const updates: Record<string, any> = {};

  let gainedPins = 0;
  let myPinDelta = 0;
  const opponentPinDeltas: Record<string, number> = {};

  for (const { opponentId, opponentName, result } of results) {
    const matchPath = `matchResults/${ym}/${type}/${myId}/${opponentId}`;
    const rewardPath = `users/${myId}/rewards/${ym}/match/${opponentId}`;

    const pinUpdatedSnap = await get(ref(db, `${matchPath}/pinUpdated`));
    if (pinUpdatedSnap.exists() && pinUpdatedSnap.val() === true) continue;

    if (result === 'win') {
      gainedPins += pinDelta;
      myPinDelta += pinDelta;

      if (type !== 'rival') {
        const oppPinSnap = await get(ref(db, `users/${opponentId}/pin`));
        const oppPin = Number(oppPinSnap.val() ?? 0);

        if (oppPin >= pinDelta) {
          opponentPinDeltas[opponentId] =
            (opponentPinDeltas[opponentId] ?? 0) - pinDelta;
        }
      }

      updates[rewardPath] = {
        type,
        opponentId,
        opponentName,
        result,
        direction: 'gain',
        pin: pinDelta,
        ym,
        createdAt: getReadableTimestamp(),
        createdAtMs: Date.now(),
      };
    }

    updates[`${matchPath}/pinUpdated`] = true;
  }

  if (myPinDelta > 0) {
    updates[`users/${myId}/pin`] = increment(myPinDelta);
  }

  for (const [oppId, delta] of Object.entries(opponentPinDeltas)) {
    updates[`users/${oppId}/pin`] = increment(delta);
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

export const addPinUsage = async (
  delta: number,
  type: string,
  detail: string,
) => {
  const empId = getCurrentUserId();
  const { getServerNow, getServerTimestamp, formatServerDate } =
    useUiStore.getState();

  const serverNow = getServerNow();
  const usageId = getServerTimestamp();
  const yyyymm = formatServerDate('ym');
  const readable = getServerTimestamp();

  const finalDelta = delta > 0 ? -delta : delta;

  await incrementPinsByEmpId(empId, finalDelta);

  await update(ref(db), {
    [`users/${empId}/pinUsage/${yyyymm}/${usageId}`]: {
      createdAt: readable,
      createdAtMs: serverNow.getTime(),
      type,
      detail,
      delta: finalDelta,
    },
  });
};
