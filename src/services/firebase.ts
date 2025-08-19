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
import { getDatabase, ref, get, set, runTransaction } from 'firebase/database';
import type { UserInfo } from '../types/UserInfo';

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
const getCurrentUserOrThrow = () => {
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

export const getCurrentUserId = async () => {
  const user = getCurrentUserOrThrow();
  return user.email?.replace('@torang.com', '');
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

// 추후 변경 예정 (관리자)
export const toggleDrawForAllUsers = async (
  currentState: boolean,
): Promise<boolean> => {
  const newState = !currentState;

  const snapshot = await get(ref(db, 'users'));
  if (!snapshot.exists()) throw new Error('사용자 데이터가 없습니다.');
  /* user > products+settings 이동 예정
  const users = snapshot.val();

  const updates: Record<string, any> = {};
  Object.keys(users).forEach((empId) => {
    updates[`users/${empId}/isDrawOpen`] = newState;
  });

  await update(ref(db), updates);
  */
  return newState;
};
