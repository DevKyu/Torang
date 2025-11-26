import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GiftIcon,
  TargetIcon,
  UsersIcon,
  UserIcon,
  ShieldIcon,
  ImagesIcon,
} from 'lucide-react';
import { logOut, checkAdminId } from '../services/firebase';

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

const baseMenuItems: MenuItem[] = [
  {
    id: 'user',
    label: '내정보',
    icon: <UserIcon size={20} />,
    disabled: false,
  },
  {
    id: 'rank',
    label: '또랑 랭킹',
    isClose: true,
    icon: <UsersIcon size={20} />,
    disabled: false,
  },

  {
    id: 'reward',
    label: '상품 신청',
    icon: <GiftIcon size={20} />,
    disabled: true,
  },
  {
    id: 'gallery',
    label: '또랑 갤러리',
    isNew: true,
    icon: <ImagesIcon size={20} />,
    disabled: false,
  },
  {
    id: 'draw',
    label: '추첨 결과',
    icon: <TargetIcon size={20} />,
    disabled: true,
  },
];

const adminMenu: MenuItem = {
  id: 'admin',
  label: '관리자 메뉴',
  icon: <ShieldIcon size={20} />,
  disabled: false,
};

const BADGE_VARIANTS = [
  { key: 'isNew', label: 'NEW', variant: 'new' },
  { key: 'isSoon', label: 'SOON', variant: 'soon' },
  { key: 'isClose', label: 'HOT', variant: 'hot' },
] as const;

const MainMenu = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const ok = await checkAdminId();
        setIsAdmin(ok);
      } catch (e) {
        console.error('checkAdminId failed:', e);
      }
    };
    init();
  }, []);

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
      case 'admin':
        navigate('/admin', { replace: true });
        break;
      case 'gallery':
        navigate('/gallery', { replace: true });
        break;
    }
  };

  const menuItems: MenuItem[] = isAdmin
    ? [...baseMenuItems, adminMenu]
    : baseMenuItems;

  return (
    <Layout title="또랑 메뉴🎳" padding="compact">
      <MenuGrid
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {menuItems.map(
          ({ id, label, icon, isNew, isSoon, isClose, disabled }) => {
            const flags = { isNew, isSoon, isClose };

            return (
              <MotionMenuCard
                key={id}
                whileTap={disabled ? undefined : { scale: 0.98 }}
                onClick={disabled ? undefined : () => handleClick(id)}
                disabled={disabled}
              >
                {BADGE_VARIANTS.map(
                  ({ key, label: badgeLabel, variant }) =>
                    flags[key as keyof typeof flags] && (
                      <MenuBadge
                        key={variant}
                        variant={variant as 'new' | 'soon' | 'hot'}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      >
                        {badgeLabel}
                      </MenuBadge>
                    ),
                )}
                <IconWrapper>{icon}</IconWrapper>
                <MenuLabel>{label}</MenuLabel>
              </MotionMenuCard>
            );
          },
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
