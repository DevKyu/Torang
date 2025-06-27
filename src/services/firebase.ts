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
export const getProductData = async () => {
  getCurrentUserOrThrow();
  const snapshot = await get(ref(db, 'products'));
  return snapshot.exists() ? snapshot.val() : null;
};

export const setProductData = async (items: Set<string>) => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  await Promise.all(
    [...items].map((item) =>
      runTransaction(ref(db, `products/${item}/raffle`), (current) => {
        if (!Array.isArray(current)) return [empId];
        return current.includes(empId) ? current : [...current, empId];
      }),
    ),
  );
};

export const removeProductData = async (items: Set<string>) => {
  const empId = getCurrentUserOrThrow().email?.replace('@torang.com', '');
  await Promise.all(
    [...items].map((item) =>
      runTransaction(ref(db, `products/${item}/raffle`), (current) => {
        if (!Array.isArray(current)) return [];
        return current.filter((id: string) => id !== empId);
      }),
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
