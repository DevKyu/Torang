import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GiftIcon,
  TargetIcon,
  UsersIcon,
  UserIcon,
  ShieldIcon,
  ImagesIcon,
  History,
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
import { useEventStore, type MenuBadgeType } from '../stores/eventStore';
import { useUiStore } from '../stores/useUiStore';

type MenuItemBase = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type MenuItem = MenuItemBase & {
  order: number;
  badge?: MenuBadgeType;
  disabled: boolean;
  loading: boolean;
};

const BASE_MENU_MAP: Record<string, MenuItemBase> = {
  user: { id: 'user', label: '내정보', icon: <UserIcon size={20} /> },
  rank: { id: 'rank', label: '또랑 랭킹', icon: <UsersIcon size={20} /> },
  history: {
    id: 'history',
    label: '활동 기록',
    icon: <History size={20} />,
  },

  gallery: {
    id: 'gallery',
    label: '또랑 갤러리',
    icon: <ImagesIcon size={20} />,
  },

  reward: { id: 'reward', label: '상품 신청', icon: <GiftIcon size={20} /> },
  draw: { id: 'draw', label: '추첨 결과', icon: <TargetIcon size={20} /> },
};

const ADMIN_MENU: MenuItemBase = {
  id: 'admin',
  label: '관리자 메뉴',
  icon: <ShieldIcon size={20} />,
};

const DEFAULT_DISABLED: Record<string, boolean> = {
  reward: true,
  draw: true,
};

const PATH_MAP: Record<string, string> = {
  user: '/myinfo',
  draw: '/draw',
  reward: '/reward',
  rank: '/ranking',
  admin: '/admin',
  gallery: '/gallery',
  history: '/history',
};

const MainMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  const syncServerTime = useUiStore((s) => s.syncServerTime);
  const loadEventConfig = useEventStore((s) => s.loadEventConfig);
  const menuConfig = useEventStore((s) => s.menu);
  const loaded = useEventStore((s) => s.loaded);

  useEffect(() => {
    syncServerTime();
    loadEventConfig();
    checkAdminId()
      .then(setIsAdmin)
      .catch(() => {});
  }, [syncServerTime, loadEventConfig]);

  useEffect(() => {
    loadEventConfig();
  }, [location.pathname, loadEventConfig]);

  const menuItems = useMemo<MenuItem[]>(() => {
    const base = isAdmin
      ? { ...BASE_MENU_MAP, admin: ADMIN_MENU }
      : BASE_MENU_MAP;

    return Object.keys(base)
      .map((id) => {
        const cfg = menuConfig[id];
        const disabled = !loaded
          ? true
          : cfg?.disabled !== undefined
            ? cfg.disabled
            : (DEFAULT_DISABLED[id] ?? false);

        return {
          ...base[id],
          order: cfg?.order ?? 999,
          badge: cfg?.badge as MenuBadgeType | undefined,
          disabled,
          loading: !loaded,
        };
      })
      .sort((a, b) => a.order - b.order);
  }, [menuConfig, isAdmin, loaded]);

  const handleClick = (id: string, disabled: boolean) => {
    if (disabled) return;

    const path = PATH_MAP[id];
    if (!path) return;
    navigate(path, { replace: true });
  };

  return (
    <Layout title="또랑 메뉴🎳" padding="compact">
      <MenuGrid>
        {menuItems.map(({ id, label, icon, badge, disabled, loading }) => (
          <MotionMenuCard
            key={id}
            disabled={disabled}
            whileTap={disabled ? undefined : { scale: 0.98 }}
            onClick={() => handleClick(id, disabled)}
          >
            {!loading && badge && (
              <MenuBadge
                variant={badge}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {badge.toUpperCase()}
              </MenuBadge>
            )}

            <IconWrapper style={{ opacity: loading ? 0.55 : 1 }}>
              {icon}
            </IconWrapper>
            <MenuLabel style={{ opacity: loading ? 0.55 : 1 }}>
              {label}
            </MenuLabel>
          </MotionMenuCard>
        ))}
      </MenuGrid>

      <SmallText
        top="far"
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
