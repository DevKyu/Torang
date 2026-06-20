import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db, waitForAuthUser, empIdFromEmail, logOut } from '../services/firebase';
import type { UserInfo } from '../types/UserInfo';

const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    waitForAuthUser().then((user) => {
      if (cancelled) return;

      const empId = empIdFromEmail(user?.email);
      if (!empId) {
        logOut();
        navigate('/', { replace: true });
        return;
      }

      const userRef = ref(db, `users/${empId}`);
      unsubscribe = onValue(
        userRef,
        (snap) => setUserInfo(snap.exists() ? snap.val() : null),
        () => { logOut(); navigate('/', { replace: true }); },
      );
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return userInfo;
};

export default useUserInfo;
