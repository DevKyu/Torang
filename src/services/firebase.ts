// 1. Firebase 초기화
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  get,
  set,
  runTransaction,
  update,
  serverTimestamp,
  remove,
  type DataSnapshot,
} from 'firebase/database';
import { getStorage } from 'firebase/storage';
import type { Month, UserInfo, Year, AppliedProduct } from '../types/userInfo';
import type { AchievementResult } from '../types/achievement';
import type { Result } from '../utils/ranking';
import type { MatchType, YearMonth } from '../types/match';
import type { ProductBundle } from '../types/product';
import { getYearMonth, resolveActivityYmd } from '../utils/date';
import { useUiStore } from '../stores/useUiStore';

// 2. Firebase App 설정
const firebaseConfig = {
  apiKey: 'AIzaSyCaTgX8mfkr8md8SF-ZfH87Qr48i1Dw6Ek',
  authDomain: 'torang-3d5a2.firebaseapp.com',
  databaseURL: 'https://torang-3d5a2-default-rtdb.firebaseio.com',
  projectId: 'torang-3d5a2',
  storageBucket: 'torang-3d5a2.firebasestorage.app',
  messagingSenderId: '1035546618430',
  appId: '1:1035546618430:web:c1cd435354dfe2e6b5ff6f',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

// 3. 공통 유틸
export const empIdFromEmail = (email?: string | null): string =>
  email?.replace('@torang.com', '') ?? '';

export const getCurrentUserOrThrow = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('로그인이 필요합니다.');
  return user;
};

export const waitForAuthUser = () =>
  new Promise<ReturnType<typeof getAuth>['currentUser']>((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });

export const getAuthHeader = async (): Promise<Record<string, string>> => {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('로그인 정보가 만료됐어요. 다시 로그인해주세요.');
  return { Authorization: `Bearer ${idToken}` };
};

// 4. 인증 관련
export const anonLogin = async () => signInAnonymously(auth);
export const loginUser = async (email: string, password: string) =>
  (await signInWithEmailAndPassword(auth, email, password)).user;
export const linkAnonymousAccount = async (email: string, password: string) => {
  const user = getCurrentUserOrThrow();
  const credential = EmailAuthProvider.credential(email, password);
  const linked = await linkWithCredential(user, credential);
  return linked.user;
};
export const logOut = async () => signOut(auth);

// 5. 유저 관련
export const checkAdminId = async (): Promise<boolean> => {
  const uid = getCurrentUserOrThrow().uid;
  const snapshot = await get(ref(db, `admins/${uid}`));
  return snapshot.exists();
};

export const getCurrentUserId = () => {
  const user = getCurrentUserOrThrow();
  return empIdFromEmail(user.email);
};

export const getCurrentUserData = async () => {
  const user = getCurrentUserOrThrow();
  const empId = empIdFromEmail(user.email);
  const snapshot = await get(ref(db, `users/${empId}`));
  return snapshot.exists() ? snapshot.val() : null;
};

export const checkEmpId = async (empId: string) => {
  getCurrentUserOrThrow();
  const snapshot = await get(ref(db, `users/${empId}`));
  return snapshot.exists() ? snapshot.val() : null;
};

export const checkEmpIdRegistration = async (
  empId: string,
): Promise<{ uid: string | null; join: string | null } | null> => {
  getCurrentUserOrThrow();
  const [uidSnap, joinSnap] = await Promise.all([
    get(ref(db, `users/${empId}/uid`)),
    get(ref(db, `users/${empId}/join`)),
  ]);
  if (!uidSnap.exists() && !joinSnap.exists()) return null;
  return {
    uid: uidSnap.exists() ? (uidSnap.val() as string) : null,
    join: joinSnap.exists() ? (joinSnap.val() as string) : null,
  };
};

export const registerUid = async (empId: string, referrerName?: string) => {
  const uid = getCurrentUserOrThrow().uid;
  const join = getYearMonth();

  const userUpdates: Record<string, unknown> = { uid, join };
  await update(ref(db, `users/${empId}`), userUpdates);

  if (referrerName && referrerName.trim()) {
    const [refEmpId, myNameSnap] = await Promise.all([
      findEmpIdByName(referrerName.trim()),
      get(ref(db, `names/${empId}`)),
    ]);
    if (refEmpId) {
      await set(ref(db, `referrals/${empId}`), {
        name: myNameSnap.exists() ? myNameSnap.val() : '',
        refEmpId,
        referrerName: referrerName.trim(),
      });
    }
  }
};

const findEmpIdByName = async (name: string): Promise<string | null> => {
  const snap = await get(ref(db, 'names'));
  if (!snap.exists()) return null;

  const names = snap.val() as Record<string, string>;
  const entry = Object.entries(names).find(
    ([, v]) => v.replace(/\s/g, '') === name.replace(/\s/g, ''),
  );

  return entry ? entry[0] : null;
};

export const getAppliedProducts = async (ym: string): Promise<Record<string, AppliedProduct>> => {
  const empId = empIdFromEmail(getCurrentUserOrThrow().email);
  const snap = await get(ref(db, `users/${empId}/products/${ym}`));
  return snap.exists() ? snap.val() : {};
};

export const applyProduct = async (ym: string, index: string, data: AppliedProduct): Promise<void> => {
  const empId = empIdFromEmail(getCurrentUserOrThrow().email);
  await set(ref(db, `users/${empId}/products/${ym}/${index}`), data);
};

export const cancelAppliedProduct = async (ym: string, index: string): Promise<boolean> => {
  const empId = empIdFromEmail(getCurrentUserOrThrow().email);
  const result = await runTransaction(
    ref(db, `users/${empId}/products/${ym}/${index}`),
    (current) => (current === null ? undefined : null),
  );
  return result.committed;
};

export const addUser = async (empId: string, user: UserInfo) => {
  const userRef = ref(db, `users/${empId}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) throw new Error('이미 존재하는 사번입니다.');

  await update(ref(db), {
    [`users/${empId}`]: user,
    [`names/${empId}`]: user.name,
  });
};

export const deleteUser = async (empId: string) => {
  await update(ref(db), {
    [`users/${empId}`]: null,
    [`names/${empId}`]: null,
    [`referrals/${empId}`]: null,
  });
};

// 6. 상품 관련
export const getProductData = async (ym: string) => {
  getCurrentUserOrThrow();
  const snapshot = await get(ref(db, `products/${ym}/items`));
  return snapshot.exists() ? snapshot.val() : null;
};

export const parseProductBundle = (snapshot: DataSnapshot): ProductBundle => {
  if (!snapshot.exists()) {
    return { items: [], meta: {} };
  }

  const data = snapshot.val();

  return {
    items: Object.values(data.items ?? {}) as ProductBundle['items'],
    meta: (data.meta ?? {}) as ProductBundle['meta'],
  };
};

export const setProductData = async (ym: string, items: Set<string>) => {
  const empId = empIdFromEmail(getCurrentUserOrThrow().email);
  await Promise.all(
    [...items].map((item) =>
      runTransaction(
        ref(db, `products/${ym}/items/${item}/raffle`),
        (current) => {
          if (!Array.isArray(current)) return [empId];
          return current.includes(empId) ? current : [...current, empId];
        },
      ),
    ),
  );
};

export const removeProductData = async (ym: string, items: Set<string>) => {
  const empId = empIdFromEmail(getCurrentUserOrThrow().email);
  await Promise.all(
    [...items].map((item) =>
      runTransaction(
        ref(db, `products/${ym}/items/${item}/raffle`),
        (current) => {
          if (!Array.isArray(current)) return [];
          return current.filter((id: string) => id !== empId);
        },
      ),
    ),
  );
};

// 7. 핀 관련
export const setUserPinData = async (pin: number) => {
  const empId = empIdFromEmail(getCurrentUserOrThrow().email);
  const result = await runTransaction(ref(db, `users/${empId}/pin`), (current) => {
    const next = (current ?? 0) + pin;
    if (next < 0) return;
    return next;
  });
  if (!result.committed) {
    throw new Error('PIN 잔액이 부족합니다.');
  }
};

export const getUserPins = async (): Promise<number> => {
  const empId = empIdFromEmail(getCurrentUserOrThrow().email);
  const snap = await get(ref(db, `users/${empId}/pin`));
  return snap.exists() ? (snap.val() as number) : 0;
};

export const incrementPinsByEmpId = async (empId: string, delta: number) => {
  await runTransaction(ref(db, `users/${empId}/pin`), (current) => {
    const newValue = (current ?? 0) + delta;
    return Math.max(0, newValue);
  });
};

export const resetAllUserPins = async (value: number = 0) => {
  const snapshot = await get(ref(db, 'users'));
  if (!snapshot.exists()) return;

  const users = snapshot.val();
  const updates: Record<string, unknown> = {};

  Object.keys(users).forEach((empId) => {
    updates[`users/${empId}/pin`] = value;
  });

  await update(ref(db), updates);
};

export const resolveCurrentActivityYmd = async (): Promise<string | null> => {
  const serverNow = useUiStore.getState().getServerNow();
  const activityAll = await getAllActivityDates();
  const activityYmd = resolveActivityYmd(
    activityAll,
    String(serverNow.getFullYear()),
    serverNow.getMonth() + 1,
  );
  return activityYmd ? String(activityYmd) : null;
};

export const adjustPinsForCurrentMonth = async (
  activityYmdOverride?: string,
): Promise<{ granted: number; failed: number } | null> => {
  try {
    const activityYmdStr = activityYmdOverride ?? (await resolveCurrentActivityYmd());
    if (!activityYmdStr) return null;

    const year = activityYmdStr.slice(0, 4) as Year;
    const month = String(Number(activityYmdStr.slice(4, 6)));
    const day = activityYmdStr.slice(6, 8);
    const ym = activityYmdStr.slice(0, 6);

    const [participantsSnap, usersSnap] = await Promise.all([
      get(ref(db, `activityParticipants/${year}/${month}`)),
      get(ref(db, 'users')),
    ]);
    if (!participantsSnap.exists() || !usersSnap.exists()) return null;

    const participants = participantsSnap.val();
    const nowMs = new Date(Number(year), Number(month) - 1, Number(day), 18, 30, 0, 0).getTime();
    const readableTime = `${activityYmdStr}1830`;

    const settled = await Promise.allSettled(
      Object.keys(participants).map(async (empId): Promise<boolean> => {
        const user = usersSnap.child(empId).val();
        if (!user) return false;

        const inc =
          user.type === 'Member' ? 1 : user.type === 'Associate' ? 0.5 : 0;
        if (inc === 0) return false;

        const rewardBaseRef = ref(db, `users/${empId}/rewards/${ym}/activity`);
        const rewardBaseSnap = await get(rewardBaseRef);

        if (rewardBaseSnap.exists()) return false;

        const claim = await runTransaction(rewardBaseRef, (cur) =>
          cur === null
            ? {
                [readableTime]: {
                  type: 'activity',
                  direction: 'gain',
                  pin: inc,
                  ym,
                  createdAt: readableTime,
                  createdAtMs: nowMs,
                },
              }
            : undefined,
        );
        if (!claim.committed) return false;

        try {
          await runTransaction(ref(db, `users/${empId}/pin`), (cur) =>
            typeof cur === 'number' ? cur + inc : inc,
          );
          return true;
        } catch (err) {
          await update(ref(db), { [`users/${empId}/rewards/${ym}/activity`]: null }).catch(
            () => {},
          );
          throw err;
        }
      }),
    );

    return {
      granted: settled.filter((r) => r.status === 'fulfilled' && r.value).length,
      failed: settled.filter((r) => r.status === 'rejected').length,
    };
  } catch {
    return null;
  }
};

let nameCache: Record<string, string> = {};
let allNamesLoaded = false;

export const preloadAllNames = async (): Promise<void> => {
  if (allNamesLoaded) return;

  const snapshot = await get(ref(db, 'names'));
  if (snapshot.exists()) {
    nameCache = snapshot.val();
    allNamesLoaded = true;
  }
};

export const getCachedUserName = (empId: string): string => {
  return nameCache[empId] ?? '???';
};

// 10. 목표 점수 관련
export const setTargetScore = async (
  year: string,
  month: string,
  target: number,
) => {
  const empId = empIdFromEmail(getCurrentUserOrThrow().email);
  const targetRef = ref(db, `users/${empId}/targets/${year}/${month}`);

  await runTransaction(targetRef, () => target);
};

type ActivityDateMap = Record<string, string | number>;
export type ActivityDateAll = Record<string, ActivityDateMap>;

export const getAllActivityDates = async (): Promise<ActivityDateAll> => {
  const snap = await get(ref(db, 'activityDate'));
  return snap.exists() ? (snap.val() as ActivityDateAll) : {};
};

// 11. 랭킹 관련
export const fetchAllUsers = async (): Promise<Record<string, UserInfo>> => {
  const snapshot = await get(ref(db, 'users'));
  if (!snapshot.exists()) return {};
  const raw = snapshot.val() as Record<string, Record<string, unknown>>;
  return Object.fromEntries(
    Object.entries(raw).map(([empId, u]) => [
      empId,
      {
        name: u.name,
        join: u.join,
        pin: typeof u.pin === 'number' ? u.pin : 0,
        type: u.type,
        scores: u.scores,
        targets: u.targets,
        invitedCount: u.invitedCount,
        lastAchievementCheck: u.lastAchievementCheck,
        lastMissionCheck: u.lastMissionCheck,
        rewards: u.rewards,
      } as UserInfo,
    ]),
  );
};

export const saveMatchResult = async (
  ym: YearMonth,
  myId: string,
  type: MatchType,
  opponentId: string,
  myScore: number,
  opponentScore: number,
  delta: number,
  result: Result,
) => {
  const resultRef = ref(db, `matchResults/${ym}/${type}/${myId}/${opponentId}`);

  const snap = await get(resultRef);
  if (
    snap.exists() &&
    snap.val().myScore === myScore &&
    snap.val().opponentScore === opponentScore
  ) {
    return;
  }

  const existingPinUpdated = snap.exists() ? snap.val().pinUpdated : undefined;

  await set(resultRef, {
    myScore,
    opponentScore,
    delta,
    result,
    finalizedAt: serverTimestamp(),
    ...(existingPinUpdated === true ? { pinUpdated: true } : {}),
  });
};

// 12. 업적 관련
export const getAllUserMatchResults = async (): Promise<
  Record<string, Record<MatchType, Record<string, Record<string, unknown>>>>
> => {
  const snapshot = await get(ref(db, 'matchResults'));
  return snapshot.exists() ? snapshot.val() : {};
};

export const saveAchievements = async (
  achievements: AchievementResult,
  today: string,
  updateLast = true,
) => {
  const empId = empIdFromEmail(getCurrentUserOrThrow().email);

  const updates: Record<string, unknown> = {
    [`users/${empId}/achievements`]: achievements,
  };
  if (updateLast) {
    updates[`users/${empId}/lastAchievementCheck`] = today;
  }
  await update(ref(db), updates);
};

// 13. 활동 참여자 관련
export const getActivityParticipants = async (
  year: string,
  month: string,
): Promise<string[]> => {
  const snap = await get(ref(db, `activityParticipants/${year}/${month}`));
  return snap.exists() ? Object.keys(snap.val()) : [];
};

// 14. 점수 관련
export const getUserYearScores = async (
  empId: string,
  year: Year,
): Promise<Partial<Record<Month, number>>> => {
  const snap = await get(ref(db, `users/${empId}/scores/${year}`));
  if (!snap.exists()) return {};

  const data = snap.val();
  const cleanData: Partial<Record<Month, number>> = {};

  Object.entries(data).forEach(([month, val]) => {
    if (typeof val === 'number') {
      cleanData[month as Month] = val;
    }
  });

  return cleanData;
};

export const setUserMonthScore = async (
  empId: string,
  year: Year,
  month: Month,
  score: number,
) => {
  await set(ref(db, `users/${empId}/scores/${year}/${month}`), score);
};

export const removeUserScore = async (
  empId: string,
  year: Year,
  month: Month,
): Promise<void> => {
  await remove(ref(db, `users/${empId}/scores/${year}/${month}`));
};

export const getAfterPartyParticipation = async (
  empId: string,
): Promise<Record<string, Record<string, boolean>>> => {
  const snap = await get(ref(db, `afterPartyParticipants`));
  if (!snap.exists()) return {};

  const data = snap.val();
  const result: Record<string, Record<string, boolean>> = {};

  for (const [year, months] of Object.entries(data)) {
    for (const [month, members] of Object.entries(
      months as Record<string, Record<string, boolean>>,
    )) {
      if (members[empId]) {
        result[year] ??= {};
        result[year][month] = true;
      }
    }
  }
  return result;
};

export const getUserGalleryUploadCount = async (empId: string): Promise<number> => {
  const snap = await get(ref(db, `users/${empId}/gallery/uploadedCount`));
  if (!snap.exists()) return 0;
  const data = snap.val() as Record<string, number>;
  return Object.values(data).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0);
};

export const getUserGalleryCommentCount = async (empId: string): Promise<number> => {
  const snap = await get(ref(db, `users/${empId}/gallery/commentedCount`));
  return snap.exists() ? (snap.val() as number) : 0;
};

export const getAllMissions = async (): Promise<Record<string, unknown>> => {
  const snap = await get(ref(db, 'missions'));
  return snap.exists() ? snap.val() : {};
};

