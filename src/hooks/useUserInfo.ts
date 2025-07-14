import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { getCurrentUserData, logOut } from '../services/firebase';
import type { UserInfo } from '../types/UserInfo';

const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      showLoading();
      try {
        const data = await getCurrentUserData();
        setUserInfo(data);
      } catch (e) {
        logOut();
        navigate('/', { replace: true });
      } finally {
        hideLoading();
      }
    };
    fetch();
  }, []);

  return userInfo;
};

export default useUserInfo;
