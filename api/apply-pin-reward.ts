import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, ServerValue } from 'firebase-admin/database';
import { ensureFirebaseAdmin, getCallerEmpId } from './_lib/firebaseAdmin';

ensureFirebaseAdmin();

const kstParts = () => {
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000);
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
  const preSnap = await referralRef.get();
  const preData = preSnap.val() as ReferralData | null;
  if (!preData || preData.rewarded || !preData.refEmpId) {
    return { rewarded: false as const };
  }

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

    return res.status(400).json({ error: 'unsupported type' });
  } catch (e) {
    console.error('[APPLY PIN REWARD]', e);
    res.status(500).json({
      error: e instanceof Error ? e.message : 'unknown error',
    });
  }
}
