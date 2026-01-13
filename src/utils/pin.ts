import { ref, get, update, increment, runTransaction } from 'firebase/database';
import {
  db,
  getCachedUserName,
  getCurrentUserId,
  incrementPinsByEmpId,
  preloadAllNames,
} from '../services/firebase';
import type { MatchResult } from '../hooks/useMatchResult';
import type { YearMonth, MatchType } from '../types/match';
import type { Result } from './ranking';
import {
  showMatchWithPinToast,
  showPinRewardToast,
  showReferrerRewardToast,
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

type ApplyPinRewardPayload = {
  empId: string;
  pin: number;
  type: 'match' | 'referral';
  ym: string;
  detail?: string;
};

export const applyPinRewardServer = async (payload: ApplyPinRewardPayload) => {
  const res = await fetch('/api/apply-pin-reward', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`applyPinRewardServer failed: ${text}`);
  }
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

export const applyReferralRewardIfNeeded = async (): Promise<boolean> => {
  const empId = getCurrentUserId();
  if (!empId) return false;

  const pin = useEventStore.getState().getPinRewardRate('referral');
  if (pin <= 0) return false;

  const referrerRef = ref(db, `users/${empId}/referrer`);
  const snap = await get(referrerRef);
  if (!snap.exists()) return false;

  const data = snap.val();
  if (!data.refEmpId || data.rewarded) return false;

  const { getServerTimestamp, formatServerDate } = useUiStore.getState();
  const rewardedAt = getServerTimestamp();
  const ym = formatServerDate('ym');

  const tx = await runTransaction(referrerRef, (cur) => {
    if (!cur || cur.rewarded) return cur;
    return {
      ...cur,
      rewarded: true,
      rewardedAt,
    };
  });

  if (!tx.committed) return false;

  await preloadAllNames();
  const myName = getCachedUserName(empId);
  const referrerName = getCachedUserName(data.refEmpId);

  await Promise.all([
    applyPinRewardServer({
      empId: data.refEmpId,
      pin,
      type: 'referral',
      ym,
      detail: `${myName}님 추천 가입`,
    }),
    applyPinRewardServer({
      empId,
      pin,
      type: 'referral',
      ym,
      detail: `${referrerName}님 추천으로 가입`,
    }),
  ]);

  setTimeout(() => showReferrerRewardToast(pin), 1500);
  return true;
};
