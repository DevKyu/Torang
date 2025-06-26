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
export const db = getDatabase(app);
export const auth = getAuth(app);

const getCurrentUserOrThrow = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('로그인이 필요합니다.');
  return user;
};

export const anonLogin = async () => {
  await signInAnonymously(auth);
};

export const getCurrentUserData = async () => {
  const user = getCurrentUserOrThrow();
  const empId = user.email?.replace('@torang.com', '');
  const snapshot = await get(ref(db, `users/${empId}`));
  return snapshot.exists() ? snapshot.val() : null;
};

export const getProductData = async () => {
  getCurrentUserOrThrow();
  const snapshot = await get(ref(db, 'products'));
  return snapshot.exists() ? snapshot.val() : null;
};

export const setProductData = async (items: Set<string>) => {
  const user = getCurrentUserOrThrow();
  const empId = user.email?.replace('@torang.com', '');

  await Promise.all(
    [...items].map((item) =>
      runTransaction(ref(db, `products/${item}/raffle`), (current) => {
        if (!Array.isArray(current)) return [empId];
        if (current.includes(empId)) return current;
        return [...current, empId];
      }),
    ),
  );
};

export const setUserPinData = async (pin: number) => {
  const user = getCurrentUserOrThrow();
  const empId = user.email?.replace('@torang.com', '');

  await runTransaction(ref(db, `users/${empId}/pin`), (current) => {
    if (current === null || typeof current !== 'number') return 0;
    return current - pin;
  });
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

export const linkAnonymousAccount = async (email: string, password: string) => {
  const user = getCurrentUserOrThrow();
  const credential = EmailAuthProvider.credential(email, password);

  try {
    const linked = await linkWithCredential(user, credential);
    return linked.user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return userCredential.user;
};

export const logOut = async () => {
  await signOut(auth);
};
