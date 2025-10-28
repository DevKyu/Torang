// 1. Firebase 초기화
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signOut,
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
} from 'firebase/database';
import type { Month, UserInfo, Year } from '../types/UserInfo';
import type { AchievementResult } from '../types/achievement';
import type { Result } from '../utils/ranking';
import type { MatchType, YearMonth } from '../types/match';
import type { ProductBundle } from '../types/Product';

// 2. Firebase App 설정
const firebaseConfig = {
  apiKey: 'AIzaSyCaTgX8mfkr8md8SF-ZfH87Qr48i1Dw6Ek',
  authDomain: 'torang-3d5a2.firebaseapp.com',
  databaseURL: 'https://torang-3d5a2-default-rtdb.firebaseio.com',
  projectId: 'torang-3d5a2',
  storageBucket: 'torang-3d5a2.appspot.com',
  messagingSenderId: '1035546618430',
  appId: '1:1035546618430:web:c1cd435354dfe2e6b5ff6f',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// 3. 공통 유틸
export const getCurrentUserOrThrow = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('로그인이 필요합니다.');
  return user;
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
  return user.email?.replace('@torang.com', '') ?? '';
};

export const getCurrentUserData = async () => {
  const user = getCurrentUserOrThrow();
  const empId = user.email?.replace('@torang.com', '');
  const snapshot = await get(ref(db, `users/${empId}`));
  return snapshot.exists() ? snapshot.val() : null;
};

export const checkEmpId = async (empId: string) => {
  getCurrentUserOrThrow();
  const snapshot = await get(ref(db, `users/${empId}`));
  return snapshot.exists() ? snapshot.val() : null;
};

export const registerUid = async (empId: string) => {
  const uid = getCurrentUserOrThrow().uid;
  await set(ref(db, `users/${empId}/uid`), uid);
};

export const getUsedItems = async (): Promise<Set<string>> => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  const snapshot = await get(ref(db, `users/${empId}/usedItems`));
  return snapshot.exists() ? new Set(snapshot.val()) : new Set();
};

export const saveUsedItems = async (items: Set<string>) => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  await set(ref(db, `users/${empId}/usedItems`), [...items]);
};

export const addUser = async (empId: string, user: UserInfo) => {
  const userRef = ref(db, `users/${empId}`);
  const snapshot = await get(userRef);
  if (snapshot.exists()) throw new Error('이미 존재하는 사번입니다.');
  await set(userRef, user);
};

export const deleteUser = async (empId: string) => {
  await remove(ref(db, `users/${empId}`));
};

// 6. 상품 관련
export const getProductData = async (yyyymm: string) => {
  getCurrentUserOrThrow();
  const snapshot = await get(ref(db, `products/${yyyymm}/items`));
  return snapshot.exists() ? snapshot.val() : null;
};

export const getProductDataWithRaffle = async (yyyymm: string) => {
  const all = await getProductData(yyyymm);
  return all?.filter((product: any) => product.raffle?.length > 0);
};

export const getProductBundle = async (
  yyyymm: string,
): Promise<ProductBundle> => {
  const snapshot = await get(ref(db, `products/${yyyymm}`));

  if (!snapshot.exists()) {
    return { items: [], meta: {} };
  }

  const data = snapshot.val();

  return {
    items: Object.values(data.items ?? {}) as ProductBundle['items'],
    meta: (data.meta ?? {}) as ProductBundle['meta'],
  };
};

export const setProductData = async (yyyymm: string, items: Set<string>) => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  await Promise.all(
    [...items].map((item) =>
      runTransaction(
        ref(db, `products/${yyyymm}/items/${item}/raffle`),
        (current) => {
          if (!Array.isArray(current)) return [empId];
          return current.includes(empId) ? current : [...current, empId];
        },
      ),
    ),
  );
};

export const removeProductData = async (yyyymm: string, items: Set<string>) => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  await Promise.all(
    [...items].map((item) =>
      runTransaction(
        ref(db, `products/${yyyymm}/items/${item}/raffle`),
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
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  await runTransaction(ref(db, `users/${empId}/pin`), (current) =>
    current === null ? 0 : current + pin,
  );
};

export const getUserPins = async (): Promise<number> => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  const snap = await get(ref(db, `users/${empId}/pin`));
  return snap.exists() ? (snap.val() as number) : 0;
};

export const incrementUserPins = async (delta: number) => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  await runTransaction(ref(db, `users/${empId}/pin`), (current) => {
    return (current ?? 0) + delta;
  });
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
  const updates: Record<string, any> = {};

  Object.keys(users).forEach((empId) => {
    updates[`users/${empId}/pin`] = value;
  });

  await update(ref(db), updates);
};

// 8. 추첨 관련
export const drawWinnerIfNotExists = async (
  yyyymm: string,
  productIndex: number,
  raffle: string[],
): Promise<string | undefined> => {
  const winnerRef = ref(db, `products/${yyyymm}/items/${productIndex}/winner`);

  const result = await runTransaction(winnerRef, (current) => {
    if (current !== null) return current;
    if (!raffle || raffle.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * raffle.length);
    return raffle[randomIndex];
  });

  return result.snapshot.val() || undefined;
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
export const getTargetScore = async (year: string, month: string) => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  const snap = await get(ref(db, `users/${empId}/targets/${year}/${month}`));
  return snap.exists() ? (snap.val() as number) : undefined;
};

export const setTargetScore = async (
  year: string,
  month: string,
  target: number,
) => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  const targetRef = ref(db, `users/${empId}/targets/${year}/${month}`);

  await runTransaction(targetRef, () => target);
};

export type ActivityDateMap = Record<string, string | number>;
export type ActivityDateAll = Record<string, ActivityDateMap>;

export const getAllActivityDates = async (): Promise<ActivityDateAll> => {
  const snap = await get(ref(db, 'activityDate'));
  return snap.exists() ? (snap.val() as ActivityDateAll) : {};
};

// 11. 랭킹 관련
export const fetchAllUsers = async (): Promise<Record<string, UserInfo>> => {
  const snapshot = await get(ref(db, 'users'));
  if (!snapshot.exists()) return {};
  return snapshot.val();
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

  await set(resultRef, {
    myScore,
    opponentScore,
    delta,
    result,
    finalizedAt: serverTimestamp(),
  });
};

// 12. 업적 관련
export const getUserMatchResults = async (
  yyyymm: string,
): Promise<Record<MatchType, Record<string, any>>> => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  const types: MatchType[] = ['rival', 'pin'];

  const result = {} as Record<MatchType, Record<string, any>>;

  for (const type of types) {
    const snap = await get(ref(db, `matchResults/${yyyymm}/${type}/${empId}`));
    if (snap.exists()) {
      result[type] = snap.val();
    }
  }

  return result;
};

export const getAllUserMatchResults = async (): Promise<
  Record<string, Record<MatchType, Record<string, Record<string, any>>>>
> => {
  const snapshot = await get(ref(db, 'matchResults'));
  return snapshot.exists() ? snapshot.val() : {};
};

export const saveAchievements = async (
  achievements: AchievementResult,
  today: string,
  updateLast = true,
) => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');

  const updates: Record<string, any> = {
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

export const setActivityParticipant = async (year: string, month: string) => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  const r = ref(db, `activityParticipants/${year}/${month}/${empId}`);
  await runTransaction(r, (current) => {
    return current === true ? current : true;
  });
};

export const removeActivityParticipant = async (
  year: string,
  month: string,
) => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  const r = ref(db, `activityParticipants/${year}/${month}/${empId}`);
  await runTransaction(r, (current) => {
    return current === null ? current : null;
  });
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

export const getUserMonthScore = async (
  empId: string,
  year: Year,
  month: Month,
): Promise<number | undefined> => {
  const snap = await get(ref(db, `users/${empId}/scores/${year}/${month}`));
  return snap.exists() ? (snap.val() as number) : undefined;
};

export const setUserMonthScore = async (
  empId: string,
  year: Year,
  month: Month,
  score: number,
) => {
  await set(ref(db, `users/${empId}/scores/${year}/${month}`), score);
};

export const updateUserScores = async (
  empId: string,
  year: Year,
  scores: Partial<Record<Month, number>>,
) => {
  const updates: Record<string, number> = {};
  Object.entries(scores).forEach(([month, val]) => {
    if (typeof val === 'number') {
      updates[`users/${empId}/scores/${year}/${month}`] = val;
    }
  });

  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }
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
  const snap = await get(ref(db, `activityParticipants`));
  if (!snap.exists()) return {};

  const data = snap.val();
  const result: Record<string, Record<string, boolean>> = {};

  for (const [year, months] of Object.entries(data)) {
    for (const [month, members] of Object.entries(
      months as Record<string, any>,
    )) {
      if (members[empId]) {
        result[year] ??= {};
        result[year][month] = true;
      }
    }
  }
  return result;
};
