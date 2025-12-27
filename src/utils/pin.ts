import { ref, get, update, increment } from 'firebase/database';
import { db, incrementPinsByEmpId } from '../services/firebase';
import type { MatchResult } from '../hooks/useMatchResult';
import type { YearMonth, MatchType } from '../types/match';
import type { Result } from './ranking';
import {
  showMatchWithPinToast,
  showPinRewardToast,
  showTargetWithPinToast,
} from './toast';
import { getReadableTimestamp, isWithinActivityDays } from './date';
import { useUiStore } from '../stores/useUiStore';
import { useEventStore } from '../stores/eventStore';

type TargetRewardPayload = {
  myScore: number;
  target: number;
  achieved: boolean;
  special: boolean;
};

type AchievementRewardPayload = {
  detail: string;
};

export const applyPinChangeBatch = async (
  ym: YearMonth,
  myId: string,
  type: MatchType,
  results: MatchResult[],
) => {
  const rate = useEventStore
    .getState()
    .getPinRewardRate(type === 'rival' ? 'rivalMatch' : 'pinMatch');

  if (rate <= 0) return;

  const updates: Record<string, any> = {};
  let gainedPins = 0;
  const opponentPinDeltas: Record<string, number> = {};

  for (const { opponentId, opponentName, result } of results) {
    const matchPath = `matchResults/${ym}/${type}/${myId}/${opponentId}`;
    const rewardPath = `users/${myId}/rewards/${ym}/match/${opponentId}`;

    const pinUpdatedSnap = await get(ref(db, `${matchPath}/pinUpdated`));
    if (pinUpdatedSnap.val() === true) continue;

    if (result === 'win') {
      gainedPins += rate;

      if (type !== 'rival') {
        const oppPinSnap = await get(ref(db, `users/${opponentId}/pin`));
        const oppPin = Number(oppPinSnap.val() ?? 0);
        if (oppPin >= rate) {
          opponentPinDeltas[opponentId] =
            (opponentPinDeltas[opponentId] ?? 0) - rate;
        }
      }

      updates[rewardPath] = {
        type: 'match',
        matchType: type,
        opponentId,
        opponentName,
        result,
        pin: rate,
        ym,
        direction: 'gain',
        createdAt: getReadableTimestamp(),
        createdAtMs: Date.now(),
      };
    }

    updates[`${matchPath}/pinUpdated`] = true;
  }

  if (gainedPins > 0) {
    updates[`users/${myId}/pin`] = increment(gainedPins);
  }

  for (const [oppId, delta] of Object.entries(opponentPinDeltas)) {
    updates[`users/${oppId}/pin`] = increment(delta);
  }

  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
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
    if (result === 'win') winCount++;

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

export const grantTargetPinReward = async ({
  empId,
  ym,
  activityYmd,
  payload,
}: {
  empId: string;
  ym: string;
  activityYmd: string;
  payload: TargetRewardPayload;
}) => {
  if (!isWithinActivityDays(activityYmd, 7)) return false;

  const rate = useEventStore.getState().getPinRewardRate('targetScore');
  if (rate <= 0) return false;

  const rewardPath = `users/${empId}/rewards/${ym}/target`;
  const snap = await get(ref(db, rewardPath));
  if (snap.exists()) return false;

  await incrementPinsByEmpId(empId, rate);

  const { getServerNow, getServerTimestamp } = useUiStore.getState();
  const now = getServerNow();
  const readable = getServerTimestamp();

  await update(ref(db), {
    [rewardPath]: {
      type: 'target',
      ...payload,
      pin: rate,
      ym,
      direction: 'gain',
      createdAt: readable,
      createdAtMs: now.getTime(),
    },
  });

  showTargetWithPinToast(rate);

  return true;
};

export const grantAchievementPinReward = async ({
  empId,
  ym,
  payload,
}: {
  empId: string;
  ym: string;
  payload: AchievementRewardPayload;
}) => {
  const rate = useEventStore.getState().getPinRewardRate('achievement');
  if (rate <= 0) return false;

  const rewardPath = `users/${empId}/rewards/${ym}/achievement`;
  const snap = await get(ref(db, rewardPath));
  if (snap.exists()) return false;

  await incrementPinsByEmpId(empId, rate);

  const { getServerNow, getServerTimestamp } = useUiStore.getState();
  const now = getServerNow();
  const readable = getServerTimestamp();

  await update(ref(db), {
    [rewardPath]: {
      type: 'achievement',
      ...payload,
      pin: rate,
      ym,
      direction: 'gain',
      createdAt: readable,
      createdAtMs: now.getTime(),
    },
  });

  setTimeout(() => {
    showPinRewardToast(rate);
  }, 1500);

  return true;
};
