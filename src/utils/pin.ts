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
import { getResultType, type Result } from './ranking';
import type { UserInfo, Year, Month } from '../types/UserInfo';
import { calcMatchMonthResult } from './matchResult';
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

export const distributeMatchPins = async (
  ym: string,
  users: Record<string, UserInfo>,
  pinRate: number,
): Promise<number> => {
  const matchSnap = await get(ref(db, `match/${ym}/pin`));
  if (!matchSnap.exists()) return 0;

  const allMatches = matchSnap.val() as Record<string, Record<string, unknown>>;
  const year = ym.slice(0, 4) as Year;
  const month = String(Number(ym.slice(4, 6))) as Month;
  const now = Date.now();
  const createdAt = getReadableTimestamp(new Date(now));

  const uniquePairs = new Set<string>();
  for (const [myId, opponents] of Object.entries(allMatches)) {
    for (const opponentId of Object.keys(opponents)) {
      uniquePairs.add([myId, opponentId].sort().join(':'));
    }
  }

  const pinDeltas: Record<string, number> = {};
  const updates: Record<string, unknown> = {};
  let processedCount = 0;

  for (const pairKey of uniquePairs) {
    const [idA, idB] = pairKey.split(':');

    const [snapAB, snapBA] = await Promise.all([
      get(ref(db, `matchResults/${ym}/pin/${idA}/${idB}/pinUpdated`)),
      get(ref(db, `matchResults/${ym}/pin/${idB}/${idA}/pinUpdated`)),
    ]);
    if (snapAB.val() === true || snapBA.val() === true) continue;

    const res = calcMatchMonthResult(idA, idB, users, year, month);
    if (typeof res.deltaAvg !== 'number') continue;

    const { deltaAvg, myScore, opponentScore } = res;
    const result = getResultType(deltaAvg);
    const resultInverse = getResultType(-deltaAvg);

    updates[`matchResults/${ym}/pin/${idA}/${idB}`] = {
      myScore, opponentScore, delta: deltaAvg, result, pinUpdated: true, finalizedAt: now,
    };
    updates[`matchResults/${ym}/pin/${idB}/${idA}`] = {
      myScore: opponentScore, opponentScore: myScore, delta: -deltaAvg, result: resultInverse, pinUpdated: true, finalizedAt: now,
    };

    if (result !== 'draw') {
      const winnerId = result === 'win' ? idA : idB;
      const loserId = result === 'win' ? idB : idA;
      const loserCurrentPin = users[loserId]?.pin ?? 0;

      pinDeltas[winnerId] = (pinDeltas[winnerId] ?? 0) + pinRate;
      updates[`users/${winnerId}/rewards/${ym}/match/${loserId}`] = {
        type: 'match',
        matchType: 'pin',
        opponentId: loserId,
        opponentName: users[loserId]?.name ?? loserId,
        result: 'win',
        pin: pinRate,
        ym,
        direction: 'gain',
        createdAt,
        createdAtMs: now,
      };

      if (loserCurrentPin >= pinRate) {
        pinDeltas[loserId] = (pinDeltas[loserId] ?? 0) - pinRate;
      }
    }

    processedCount++;
  }

  await Promise.all(
    Object.entries(pinDeltas).map(async ([empId, delta]) => {
      if (delta === 0) return;
      const pinSnap = await get(ref(db, `users/${empId}/pin`));
      const currentPin = (pinSnap.val() as number) ?? 0;
      updates[`users/${empId}/pin`] = Math.max(0, currentPin + delta);
    }),
  );

  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }

  return processedCount;
};
