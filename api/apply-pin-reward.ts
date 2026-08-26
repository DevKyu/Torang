import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, ServerValue } from 'firebase-admin/database';
import { ensureFirebaseAdmin, getCallerEmpId } from './_lib/firebaseAdmin.js';

ensureFirebaseAdmin();

const REWARD_CLAIM_WINDOW_DAYS = 7;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const CUTOFF_UTC_HOUR = 9;
const CUTOFF_UTC_MINUTE = 30;

const kstParts = () => {
  const d = new Date(Date.now() + KST_OFFSET_MS);
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return {
    y: d.getUTCFullYear(),
    mo: pad(d.getUTCMonth() + 1),
    day: pad(d.getUTCDate()),
    h: pad(d.getUTCHours()),
    mi: pad(d.getUTCMinutes()),
    s: pad(d.getUTCSeconds()),
    ms: pad(d.getUTCMilliseconds(), 3),
  };
};

type ReferralData = {
  name?: string;
  refEmpId?: string;
  referrerName?: string;
  rewarded?: boolean;
  rewardedAt?: string;
};

const applyReferralReward = async (empId: string) => {
  const db = getDatabase();

  const pinRateSnap = await db.ref('eventConfig/referralPin').get();
  const pinRate =
    typeof pinRateSnap.val() === 'number' ? (pinRateSnap.val() as number) : 0;
  if (pinRate <= 0) return { rewarded: false as const };

  const { y, mo, day, h, mi, s, ms } = kstParts();
  const rewardedAt = `${y}${mo}${day}${h}${mi}`;
  const rewardKey = `${rewardedAt}${s}${ms}`;
  const ym = `${y}${mo}`;

  const referralRef = db.ref(`referrals/${empId}`);

  const preData = (await referralRef.get()).val() as ReferralData | null;

  const tx = await referralRef.transaction((cur: ReferralData | null) => {
    const seed = cur ?? preData;
    if (!seed || seed.rewarded || !seed.refEmpId) return;
    return { ...seed, rewarded: true, rewardedAt, pin: pinRate };
  });

  if (!tx.committed) return { rewarded: false as const };

  const committed = tx.snapshot.val() as ReferralData | null;
  const refEmpId = committed?.refEmpId;
  if (!refEmpId || committed?.rewardedAt !== rewardedAt) {
    return { rewarded: false as const };
  }

  let myName =
    typeof committed?.name === 'string' && committed.name ? committed.name : '';
  if (!myName) {
    const myNameSnap = await db.ref(`names/${empId}`).get();
    myName = typeof myNameSnap.val() === 'string' ? myNameSnap.val() : '???';
  }
  const referrerName =
    typeof committed?.referrerName === 'string' && committed.referrerName
      ? committed.referrerName
      : '???';

  const nowMs = Date.now();
  const updates: Record<string, unknown> = {
    [`users/${refEmpId}/pin`]: ServerValue.increment(pinRate),
    [`users/${refEmpId}/rewards/${ym}/referral/${rewardKey}`]: {
      type: 'referral',
      direction: 'gain',
      pin: pinRate,
      ym,
      detail: `${myName}님 추천 가입`,
      createdAt: rewardedAt,
      createdAtMs: nowMs,
    },
    [`users/${refEmpId}/invitedCount`]: ServerValue.increment(1),
    [`users/${empId}/pin`]: ServerValue.increment(pinRate),
    [`users/${empId}/rewards/${ym}/referral/${rewardKey}`]: {
      type: 'referral',
      direction: 'gain',
      pin: pinRate,
      ym,
      detail: `${referrerName}님 추천으로 가입`,
      createdAt: rewardedAt,
      createdAtMs: nowMs,
    },
  };

  try {
    await db.ref().update(updates);
  } catch (err) {
    await referralRef
      .update({ rewarded: null, rewardedAt: null, pin: null })
      .catch(() => {});
    throw err;
  }

  return { rewarded: true as const, pin: pinRate };
};

const applyTargetScoreReward = async (empId: string, activityYmd: string) => {
  if (!/^\d{8}$/.test(activityYmd)) return { rewarded: false as const };

  const db = getDatabase();
  const year = activityYmd.slice(0, 4);
  const paddedMonth = activityYmd.slice(4, 6);
  const month = String(Number(paddedMonth));
  const day = activityYmd.slice(6, 8);
  const ym = `${year}${paddedMonth}`;

  const [activityDateResult, rateResult] = await Promise.allSettled([
    db.ref(`activityDate/${year}/${month}`).get(),
    db.ref(`eventConfig/pinReward/${ym}/targetScore`).get(),
  ]);
  if (activityDateResult.status === 'rejected') throw activityDateResult.reason;
  const activityDateSnap = activityDateResult.value;
  if (activityDateSnap.val() !== Number(activityYmd)) {
    return { rewarded: false as const };
  }
  if (rateResult.status === 'rejected') throw rateResult.reason;
  const rateSnap = rateResult.value;

  const activityMidnightUtcMs =
    Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0) -
    KST_OFFSET_MS;
  const diffDays = Math.floor(
    (Date.now() - activityMidnightUtcMs) / (24 * 60 * 60 * 1000),
  );
  if (diffDays < 0 || diffDays > REWARD_CLAIM_WINDOW_DAYS) {
    return { rewarded: false as const };
  }

  const rate = typeof rateSnap.val() === 'number' ? (rateSnap.val() as number) : 0;
  if (rate <= 0) return { rewarded: false as const };

  const [scoreSnap, targetSnap, targetMetaSnap] = await Promise.all([
    db.ref(`users/${empId}/scores/${year}/${month}`).get(),
    db.ref(`users/${empId}/targets/${year}/${month}`).get(),
    db.ref(`users/${empId}/targetMeta/${year}/${month}/updatedAt`).get(),
  ]);

  const myScore = scoreSnap.val();
  const target = targetSnap.val();
  if (typeof myScore !== 'number' || typeof target !== 'number') {
    return { rewarded: false as const };
  }

  const cutoffUtcMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    CUTOFF_UTC_HOUR,
    CUTOFF_UTC_MINUTE,
    0,
    0,
  );
  const targetUpdatedAtMs = targetMetaSnap.val();
  if (typeof targetUpdatedAtMs !== 'number' || targetUpdatedAtMs > cutoffUtcMs) {
    return { rewarded: false as const };
  }

  if (myScore < target) return { rewarded: false as const };
  const special = myScore === target;

  const { y, mo, day: kDay, h, mi } = kstParts();
  const createdAt = `${y}${mo}${kDay}${h}${mi}`;
  const rewardPath = `users/${empId}/rewards/${ym}/target`;
  const rewardRef = db.ref(rewardPath);

  const rewardRecord = {
    type: 'target',
    myScore,
    target,
    achieved: true,
    special,
    pin: rate,
    ym,
    direction: 'gain',
    createdAt,
    createdAtMs: Date.now(),
  };

  const tx = await rewardRef.transaction((cur: unknown) =>
    cur === null ? rewardRecord : undefined,
  );
  if (!tx.committed) return { rewarded: false as const };

  try {
    await db.ref().update({ [`users/${empId}/pin`]: ServerValue.increment(rate) });
  } catch (err) {
    await rewardRef.remove().catch(() => {});
    throw err;
  }

  return { rewarded: true as const, pin: rate, special };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { type } = (req.body ?? {}) as { type?: string };

  let empId: string;
  try {
    empId = await getCallerEmpId(req);
  } catch {
    return res.status(401).json({ error: '권한이 없습니다.' });
  }

  try {
    if (type === 'referral') {
      const result = await applyReferralReward(empId);
      return res.status(200).json({ success: true, ...result });
    }

    if (type === 'targetScore') {
      const { activityYmd } = (req.body ?? {}) as { activityYmd?: string };
      if (typeof activityYmd !== 'string') {
        return res.status(400).json({ error: 'activityYmd required' });
      }
      const result = await applyTargetScoreReward(empId, activityYmd);
      return res.status(200).json({ success: true, ...result });
    }

    return res.status(400).json({ error: 'unsupported type' });
  } catch (e) {
    console.error('[APPLY PIN REWARD]', e);
    res.status(500).json({
      error: e instanceof Error ? e.message : 'unknown error',
    });
  }
}
