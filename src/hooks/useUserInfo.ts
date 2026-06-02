import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db, getCurrentUserId, logOut } from '../services/firebase';
import type { UserInfo } from '../types/UserInfo';

const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const empId = getCurrentUserId();
    if (!empId) {
      logOut();
      navigate('/', { replace: true });
      return;
    }

    const userRef = ref(db, `users/${empId}`);
    const unsubscribe = onValue(
      userRef,
      (snap) => setUserInfo(snap.exists() ? snap.val() : null),
      () => { logOut(); navigate('/', { replace: true }); },
    );
    return () => unsubscribe();
  }, []);

  return userInfo;
};

export default useUserInfo;
