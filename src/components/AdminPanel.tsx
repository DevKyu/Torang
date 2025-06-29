import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getCurrentUserData,
  toggleDrawForAllUsers,
} from '../services/firebase';
import { Button, Section } from '../styles/commonStyle';
import { useLoading } from '../contexts/LoadingContext';

const AdminPanel = () => {
  const [isDrawOpen, setIsDrawOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const fetchDrawStatus = async () => {
      const userData = await getCurrentUserData();
      if (userData) setIsDrawOpen(userData.isDrawOpen);
    };
    fetchDrawStatus();
  }, []);

  const handleToggleDraw = async () => {
    showLoading();
    setLoading(true);
    try {
      const updatedState = await toggleDrawForAllUsers(isDrawOpen);
      setIsDrawOpen(updatedState);
      toast.success(
        `전체 유저 추첨 상태가 ${updatedState ? '활성화' : '비활성화'}되었습니다!`,
      );
    } catch (e) {
      toast.error(`오류 : ${e}`);
    } finally {
      hideLoading();
      setLoading(false);
    }
  };

  return (
    <Section>
      <h2>관리자 패널</h2>
      <Button onClick={handleToggleDraw} disabled={loading}>
        {loading
          ? '처리 중...'
          : isDrawOpen
            ? '전체 추첨 닫기'
            : '전체 추첨 열기'}
      </Button>
    </Section>
  );
};

export default AdminPanel;
