import { ref, get, update, increment } from 'firebase/database';
import {
  getAuthHeader,
  db,
  getCurrentUserId,
  incrementPinsByEmpId,
} from '../services/firebase';
import type { MatchResult } from '../hooks/useMatchResult';
import type { YearMonth, MatchType } from '../types/match';
import { getResultType } from './ranking';
import type { UserInfo, Year, Month } from '../types/UserInfo';
import { calcMatchMonthResult } from './matchResult';
import {
  showMatchWithPinToast,
  showPinRewardToast,
  showReferrerRewardToast,
  showTargetWithPinToast,
} from './toast';
import { isWithinActivityDays } from './date';
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

  const { getServerNow, getServerTimestamp } = useUiStore.getState();
  const serverNow = getServerNow();
  const serverTs = serverNow.getTime();
  const serverReadable = getServerTimestamp();

  const updates: Record<string, unknown> = {};
  let gainedPins = 0;

  for (const { opponentId, opponentName, result } of results) {
    const matchPath = `matchResults/${ym}/${type}/${myId}/${opponentId}`;
    const rewardPath = `users/${myId}/rewards/${ym}/match/${opponentId}`;

    const pinUpdatedSnap = await get(ref(db, `${matchPath}/pinUpdated`));
    if (pinUpdatedSnap.val() === true) continue;

    if (result === 'win') {
      gainedPins += rate;
      updates[rewardPath] = {
        type: 'match',
        matchType: type,
        opponentId,
        opponentName,
        result,
        pin: rate,
        ym,
        direction: 'gain',
        createdAt: serverReadable,
        createdAtMs: serverTs,
      };
    }

    updates[`${matchPath}/pinUpdated`] = true;
  }

  if (gainedPins > 0) {
    updates[`users/${myId}/pin`] = increment(gainedPins);
  }

  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
    showMatchWithPinToast(gainedPins, type);
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

  const referralSnap = await get(ref(db, `referrals/${empId}`));
  if (!referralSnap.exists()) return false;

  const data = referralSnap.val();
  if (!data.refEmpId || data.rewarded) return false;

  let result: { rewarded?: boolean; pin?: number };
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch('/api/apply-pin-reward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
      body: JSON.stringify({ type: 'referral' }),
    });
    if (!res.ok) return false;
    result = await res.json();
  } catch {
    return false;
  }

  if (!result.rewarded) return false;

  useUiStore.getState().onMessagePopupCleared(() => {
    if (getCurrentUserId() !== empId) return;
    showReferrerRewardToast(result.pin ?? 0);
  });
  return true;
};

export const distributeMatchPins = async (
  ym: string,
  users: Record<string, UserInfo>,
  pinRate: number,
): Promise<{ processedCount: number; clampedEmpIds: string[] }> => {
  const matchSnap = await get(ref(db, `match/${ym}/pin`));
  if (!matchSnap.exists()) return { processedCount: 0, clampedEmpIds: [] };

  const allMatches = matchSnap.val() as Record<string, Record<string, unknown>>;
  const year = ym.slice(0, 4) as Year;
  const month = String(Number(ym.slice(4, 6))) as Month;
  const { getServerNow, getServerTimestamp } = useUiStore.getState();
  const serverNow = getServerNow();
  const now = serverNow.getTime();
  const createdAt = getServerTimestamp();

  const pinDeltas: Record<string, number> = {};
  const updates: Record<string, unknown> = {};
  let processedCount = 0;

  for (const [chooserId, chosen] of Object.entries(allMatches)) {
    for (const chosenId of Object.keys(chosen)) {
      const snap = await get(
        ref(db, `matchResults/${ym}/pin/${chooserId}/${chosenId}/pinUpdated`),
      );
      if (snap.val() === true) continue;

      const res = calcMatchMonthResult(chooserId, chosenId, users, year, month);
      if (typeof res.deltaAvg !== 'number') continue;

      const { deltaAvg, myScore, opponentScore } = res;
      const result = getResultType(deltaAvg);

      updates[`matchResults/${ym}/pin/${chooserId}/${chosenId}`] = {
        myScore,
        opponentScore,
        delta: deltaAvg,
        result,
        pinUpdated: true,
        finalizedAt: now,
      };

      if (result === 'win') {
        pinDeltas[chooserId] = (pinDeltas[chooserId] ?? 0) + pinRate;
        updates[`users/${chooserId}/rewards/${ym}/match/${chosenId}`] = {
          type: 'match',
          matchType: 'pin',
          opponentId: chosenId,
          opponentName: users[chosenId]?.name ?? chosenId,
          result: 'win',
          pin: pinRate,
          ym,
          direction: 'gain',
          createdAt,
          createdAtMs: now,
        };
      } else if (result === 'lose') {
        pinDeltas[chooserId] = (pinDeltas[chooserId] ?? 0) - pinRate;
        updates[`users/${chooserId}/rewards/${ym}/match/${chosenId}`] = {
          type: 'match',
          matchType: 'pin',
          opponentId: chosenId,
          opponentName: users[chosenId]?.name ?? chosenId,
          result: 'lose',
          pin: pinRate,
          ym,
          direction: 'loss',
          createdAt,
          createdAtMs: now,
        };
      }

      processedCount++;
    }
  }

  const clampedEmpIds: string[] = [];

  await Promise.all(
    Object.entries(pinDeltas).map(async ([empId, delta]) => {
      if (delta === 0) return;
      const pinSnap = await get(ref(db, `users/${empId}/pin`));
      const currentPin = (pinSnap.val() as number) ?? 0;
      const wouldBe = currentPin + delta;
      if (wouldBe < 0) {
        clampedEmpIds.push(empId);
        updates[`matchResults/${ym}/pinClampWarning/${empId}/shortfall`] =
          increment(-wouldBe);
        updates[`matchResults/${ym}/pinClampWarning/${empId}/lastClampedAt`] = now;
      }
      updates[`users/${empId}/pin`] = Math.max(0, wouldBe);
    }),
  );

  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }

  return { processedCount, clampedEmpIds };
};

export const rollbackMatchPins = async (
  ym: string,
): Promise<{
  affectedCount: number;
  clampWarningEmpIds: string[];
  rollbackClampedEmpIds: string[];
}> => {
  const resultsSnap = await get(ref(db, `matchResults/${ym}/pin`));
  if (!resultsSnap.exists()) {
    return { affectedCount: 0, clampWarningEmpIds: [], rollbackClampedEmpIds: [] };
  }

  const allResults = resultsSnap.val() as Record<
    string,
    Record<string, { pinUpdated?: boolean; finalizedAt?: number }>
  >;

  const updates: Record<string, unknown> = {};
  const pinDeltas: Record<string, number> = {};

  const pairs: [string, string][] = [];
  for (const [idA, opponents] of Object.entries(allResults)) {
    for (const [idB, data] of Object.entries(opponents)) {
      if (!data.pinUpdated) continue;
      pairs.push([idA, idB]);
      updates[`matchResults/${ym}/pin/${idA}/${idB}`] = null;
    }
  }

  const [warningSnap] = await Promise.all([
    get(ref(db, `matchResults/${ym}/pinClampWarning`)),
    Promise.all(
      pairs.map(async ([idA, idB]) => {
        const rewardSnap = await get(ref(db, `users/${idA}/rewards/${ym}/match/${idB}`));
        if (!rewardSnap.exists()) return;
        const reward = rewardSnap.val() as { direction?: string; pin?: number };
        const pin = reward?.pin ?? 0;
        if (pin <= 0) return;
        if (reward?.direction === 'gain') {
          pinDeltas[idA] = (pinDeltas[idA] ?? 0) - pin;
        } else if (reward?.direction === 'loss') {
          pinDeltas[idA] = (pinDeltas[idA] ?? 0) + pin;
        }
        updates[`users/${idA}/rewards/${ym}/match/${idB}`] = null;
      }),
    ),
  ]);

  const clampWarningData = warningSnap.exists()
    ? (warningSnap.val() as Record<string, { shortfall?: number }>)
    : {};
  const clampWarningEmpIds = Object.keys(clampWarningData);

  clampWarningEmpIds.forEach((empId) => {
    const shortfall = clampWarningData[empId]?.shortfall ?? 0;
    pinDeltas[empId] = (pinDeltas[empId] ?? 0) - shortfall;
  });

  const rollbackClampedEmpIds: string[] = [];

  await Promise.all(
    Object.entries(pinDeltas).map(async ([empId, delta]) => {
      if (delta === 0) return;
      const pinSnap = await get(ref(db, `users/${empId}/pin`));
      const currentPin = (pinSnap.val() as number) ?? 0;
      const wouldBe = currentPin + delta;
      if (wouldBe < 0) rollbackClampedEmpIds.push(empId);
      updates[`users/${empId}/pin`] = Math.max(0, wouldBe);
    }),
  );

  if (clampWarningEmpIds.length > 0) {
    updates[`matchResults/${ym}/pinClampWarning`] = null;
  }

  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }

  return {
    affectedCount: Object.keys(pinDeltas).length,
    clampWarningEmpIds,
    rollbackClampedEmpIds,
  };
};
