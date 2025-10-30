import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { useLoading } from '../contexts/LoadingContext';
import { db, getCurrentUserId, logOut } from '../services/firebase';
import type { UserInfo } from '../types/UserInfo';

const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    const empId = getCurrentUserId();
    if (!empId) {
      logOut();
      navigate('/', { replace: true });
      return;
    }

    const userRef = ref(db, `users/${empId}`);
    showLoading();

    const unsubscribe = onValue(
      userRef,
      (snap) => {
        if (snap.exists()) {
          setUserInfo(snap.val());
        } else {
          setUserInfo(null);
        }
        hideLoading();
      },
      () => {
        hideLoading();
        logOut();
        navigate('/', { replace: true });
      },
    );
    return () => unsubscribe();
  }, []);

  return userInfo;
};

export default useUserInfo;
