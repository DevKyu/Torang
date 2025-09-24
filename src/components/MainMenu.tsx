import { useNavigate } from 'react-router-dom';
import { GiftIcon, TargetIcon, UsersIcon, UserIcon } from 'lucide-react';
import { logOut } from '../services/firebase';

import Layout from './layouts/Layout';
import { SmallText } from '../styles/commonStyle';
import {
  MenuGrid,
  MotionMenuCard,
  MenuLabel,
  IconWrapper,
  MenuBadge,
} from '../styles/menuStyle';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  isNew?: boolean;
  isSoon?: boolean;
  isClose?: boolean;
  disabled?: boolean;
};

const menuItems: MenuItem[] = [
  {
    id: 'user',
    label: '내정보',
    icon: <UserIcon size={20} />,
    isClose: true,
    disabled: false,
  },
  {
    id: 'rank',
    label: '또랑 랭킹',
    icon: <UsersIcon size={20} />,
    isNew: true,
    disabled: false,
  },
  {
    id: 'reward',
    label: '상품 신청',
    icon: <GiftIcon size={20} />,
    disabled: true,
    isSoon: true,
  },
  {
    id: 'draw',
    label: '추첨 결과',
    icon: <TargetIcon size={20} />,
    disabled: true,
  },
];

const MainMenu = () => {
  const navigate = useNavigate();

  const handleClick = (id: string) => {
    switch (id) {
      case 'user':
        navigate('/myinfo', { replace: true });
        break;
      case 'draw':
        navigate('/draw', { replace: true });
        break;
      case 'reward':
        navigate('/reward', { replace: true });
        break;
      case 'rank':
        navigate('/ranking', { replace: true });
        break;
    }
  };

  return (
    <Layout title="또랑 메뉴🎳" padding="compact">
      <MenuGrid
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {menuItems.map(
          ({ id, label, icon, isNew, isSoon, isClose, disabled }) => (
            <MotionMenuCard
              key={id}
              whileTap={disabled ? undefined : { scale: 0.98 }}
              onClick={disabled ? undefined : () => handleClick(id)}
              disabled={disabled}
            >
              {isNew && (
                <MenuBadge
                  variant="new"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  NEW
                </MenuBadge>
              )}
              {isSoon && (
                <MenuBadge
                  variant="soon"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  SOON
                </MenuBadge>
              )}
              {isClose && (
                <MenuBadge
                  variant="hot"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  HOT
                </MenuBadge>
              )}
              <IconWrapper>{icon}</IconWrapper>
              <MenuLabel>{label}</MenuLabel>
            </MotionMenuCard>
          ),
        )}
      </MenuGrid>

      <SmallText
        top="far"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        onClick={() => {
          logOut();
          navigate('/', { replace: true });
        }}
      >
        나가기
      </SmallText>
    </Layout>
  );
};

export default MainMenu;
