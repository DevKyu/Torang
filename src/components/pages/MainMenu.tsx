import {
  type ReactNode,
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  GiftIcon,
  UserIcon,
  ShieldIcon,
  ImagesIcon,
  NotebookPen,
  Dices,
  Trophy,
  Swords,
  PartyPopper,
  Bell,
} from 'lucide-react';
import {
  logOut,
  checkAdminId,
  waitForAuthUser,
  empIdFromEmail,
} from '../../services/firebase';

import Layout from '../layouts/Layout';
import MessageModal from '../shared/MessageModal';
import NotificationHistorySheet from '../shared/NotificationHistorySheet';
import ChecklistPopupModal from '../shared/ChecklistPopupModal';
import { SmallText } from '../../styles/global/commonStyle';
import {
  MenuGrid,
  MotionMenuCard,
  MenuLabel,
  IconWrapper,
  BadgeSlot,
  MenuBadge,
  MenuHeaderRow,
  MenuTitleText,
  BellSpacer,
  BellBtn,
  BellCountBadge,
} from '../../styles/pages/menuStyle';
import {
  useEventStore,
  DEFAULT_MENU_DISABLED,
  type MenuBadgeConfig,
} from '../../stores/eventStore';
import { useUiStore } from '../../stores/useUiStore';
import {
  preloadMyInfo,
  preloadRanking,
  preloadGalleryPage,
  preloadReward,
  preloadDraw,
  preloadActivityHistory,
  preloadMissionPage,
  preloadTeamFormation,
} from '../../routes/lazyPreloads';
import { applyReferralRewardIfNeeded } from '../../utils/pin';
import {
  useMessageInbox,
  type AdminMessage,
  type MessageHistoryItem,
} from '../../hooks/useMessages';
import { useMonthlyChecklist } from '../../hooks/useMonthlyChecklist';
import { usePostActivityChecklist } from '../../hooks/usePostActivityChecklist';
import { useActivityDates } from '../../hooks/useActivityDates';
import { useMonthParticipants } from '../../hooks/useMonthParticipants';
import { useMatch } from '../../hooks/useMatch';
import { resolveActivityYmd } from '../../utils/date';
import type { YearMonth } from '../../types/match';
import { useLatestRef } from '../../hooks/useLatestRef';

type MenuItemBase = {
  id: string;
  label: string;
  icon: ReactNode;
};

type MenuItem = MenuItemBase & {
  order: number;
  badge?: MenuBadgeConfig;
  disabled: boolean;
  loading: boolean;
  hidden: boolean;
};

const BASE_MENU_MAP: Record<string, MenuItemBase> = {
  user: { id: 'user', label: '내정보', icon: <UserIcon size={20} /> },
  rank: { id: 'rank', label: '또랑 랭킹', icon: <Trophy size={20} /> },
  history: {
    id: 'history',
    label: '활동 기록',
    icon: <NotebookPen size={20} />,
  },
  mission: {
    id: 'mission',
    label: '활동 미션',
    icon: <Swords size={20} />,
  },
  reward: { id: 'reward', label: '상품 신청', icon: <GiftIcon size={20} /> },

  gallery: {
    id: 'gallery',
    label: '또랑 갤러리',
    icon: <ImagesIcon size={20} />,
  },
  teams: {
    id: 'teams',
    label: '팀 편성',
    icon: <Dices size={20} />,
  },
  draw: { id: 'draw', label: '추첨 결과', icon: <PartyPopper size={20} /> },
};

const ADMIN_MENU: MenuItemBase = {
  id: 'admin',
  label: '관리자 메뉴',
  icon: <ShieldIcon size={20} />,
};

const DEFAULT_ORDER: Record<string, number> = {
  user: 1,
  rank: 2,
  history: 3,
  mission: 4,
  teams: 5,
  gallery: 6,
  reward: 7,
  draw: 8,
};

const PATH_MAP: Record<string, string> = {
  user: '/myinfo',
  draw: '/draw',
  reward: '/reward',
  rank: '/ranking',
  admin: '/admin',
  gallery: '/gallery',
  history: '/history',
  mission: '/mission',
  teams: '/teams',
};

const CHUNK_PRELOADERS: Record<string, () => Promise<unknown>> = {
  user: preloadMyInfo,
  rank: preloadRanking,
  gallery: preloadGalleryPage,
  reward: preloadReward,
  draw: preloadDraw,
  history: preloadActivityHistory,
  mission: preloadMissionPage,
  teams: preloadTeamFormation,
};

let mainMenuChunksReadyPromise: Promise<void> | null = null;

const ensureMainMenuChunksLoaded = () => {
  if (!mainMenuChunksReadyPromise) {
    mainMenuChunksReadyPromise = Promise.all(
      Object.values(CHUNK_PRELOADERS).map((preload) =>
        preload().catch(() => {}),
      ),
    ).then(() => {});
  }
  return mainMenuChunksReadyPromise;
};

const MainMenu = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [myEmpId, setMyEmpId] = useState('');
  const [messagesReady, setMessagesReady] = useState(false);
  const [autoShowQueue, setAutoShowQueue] = useState<AdminMessage[]>([]);
  const [historySheetOpen, setHistorySheetOpen] = useState(false);
  const [historyDetail, setHistoryDetail] = useState<MessageHistoryItem | null>(
    null,
  );
  const queueTotalRef = useRef(0);

  const syncServerTime = useUiStore((s) => s.syncServerTime);
  const hasShownMessagesPopup = useUiStore((s) => s.hasShownMessagesPopup);
  const setShownMessagesPopup = useUiStore((s) => s.setShownMessagesPopup);
  const setMessagePopupActive = useUiStore((s) => s.setMessagePopupActive);
  const loadEventConfig = useEventStore((s) => s.loadEventConfig);
  const menuConfig = useEventStore((s) => s.menu);
  const loaded = useEventStore((s) => s.loaded);
  const {
    queue,
    history,
    unreadCount,
    loading: queueLoading,
  } = useMessageInbox(myEmpId);

  const { formatServerDate: checklistFormatServerDate } = useUiStore.getState();
  const checklistServerYear = checklistFormatServerDate('year');
  const checklistServerMonth = Number(checklistFormatServerDate('month'));
  const checklistServerYm = checklistFormatServerDate('ym');
  const { maps: activityAll, loading: activityLoading } = useActivityDates();
  const activityYmdStr = resolveActivityYmd(
    activityAll,
    checklistServerYear,
    checklistServerMonth,
  );
  const participantsYear = activityYmdStr
    ? activityYmdStr.slice(0, 4)
    : checklistServerYear;
  const participantsMonth = activityYmdStr
    ? Number(activityYmdStr.slice(4, 6))
    : checklistServerMonth;
  const { participants: monthParticipants, loading: participantsLoading } =
    useMonthParticipants(participantsYear, participantsMonth);
  const checklistMatchType = useEventStore((s) => s.matchType);
  const checklistActivityYm = activityYmdStr?.slice(0, 6) ?? checklistServerYm;
  const { choices: matchChoices, loading: matchChoicesLoading } = useMatch(
    checklistActivityYm as YearMonth,
    myEmpId || null,
    checklistMatchType,
  );
  const sharedChecklistData = {
    activityAll,
    activityLoading,
    activityYmdStr,
    monthParticipants,
    participantsLoading,
    matchChoices,
    matchChoicesLoading,
  };

  const hasShownChecklistPopup = useUiStore((s) => s.hasShownChecklistPopup);
  const setShownChecklistPopup = useUiStore((s) => s.setShownChecklistPopup);
  const { items: checklistItems, loading: checklistLoading } =
    useMonthlyChecklist(myEmpId || null, sharedChecklistData);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const checklistItemsRef = useLatestRef(checklistItems);
  const checklistRegisteredRef = useRef(false);

  const hasShownPostActivityChecklistPopup = useUiStore(
    (s) => s.hasShownPostActivityChecklistPopup,
  );
  const setShownPostActivityChecklistPopup = useUiStore(
    (s) => s.setShownPostActivityChecklistPopup,
  );
  const {
    items: postActivityChecklistItems,
    loading: postActivityChecklistLoading,
  } = usePostActivityChecklist(myEmpId || null, sharedChecklistData);
  const [postActivityChecklistOpen, setPostActivityChecklistOpen] =
    useState(false);
  const postActivityChecklistItemsRef = useLatestRef(
    postActivityChecklistItems,
  );
  const pendingPostActivityOpenRef = useRef(false);

  useEffect(() => {
    ensureMainMenuChunksLoaded();
  }, []);

  useEffect(() => {
    const run = async () => {
      await Promise.all([syncServerTime(), loadEventConfig()]);
      const user = await waitForAuthUser();
      setMyEmpId(empIdFromEmail(user?.email));
      const [isAdminResult] = await Promise.all([
        checkAdminId().catch(() => false),
        applyReferralRewardIfNeeded().catch(() => false),
      ]);
      setIsAdmin(isAdminResult);
    };

    run();
  }, [syncServerTime, loadEventConfig]);

  useEffect(() => {
    const t = setTimeout(() => setMessagesReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!messagesReady || hasShownMessagesPopup || !myEmpId || queueLoading) {
      return;
    }
    setAutoShowQueue(queue);
    setShownMessagesPopup();
  }, [
    messagesReady,
    hasShownMessagesPopup,
    myEmpId,
    queue,
    queueLoading,
    setShownMessagesPopup,
  ]);

  useEffect(() => {
    if (autoShowQueue.length === 0) {
      queueTotalRef.current = 0;
    } else if (autoShowQueue.length > queueTotalRef.current) {
      queueTotalRef.current = autoShowQueue.length;
    }
  }, [autoShowQueue.length]);

  useEffect(() => {
    const blocking = !hasShownMessagesPopup || autoShowQueue.length > 0;
    setMessagePopupActive(blocking);
  }, [hasShownMessagesPopup, autoShowQueue.length, setMessagePopupActive]);

  const handleMessagePopupClose = () => {
    setAutoShowQueue((prev) => prev.slice(1));
  };

  const openPostActivityChecklist = useCallback(() => {
    if (useUiStore.getState().hasShownPostActivityChecklistPopup) return;
    setShownPostActivityChecklistPopup();
    if (postActivityChecklistItemsRef.current.length > 0) {
      setPostActivityChecklistOpen(true);
    }
  }, [setShownPostActivityChecklistPopup, postActivityChecklistItemsRef]);

  useEffect(() => {
    if (checklistRegisteredRef.current) return;
    if (!myEmpId || !loaded || checklistLoading || postActivityChecklistLoading) {
      return;
    }
    if (hasShownChecklistPopup && hasShownPostActivityChecklistPopup) return;
    checklistRegisteredRef.current = true;

    useUiStore.getState().onMessagePopupCleared(() => {
      let preOpened = false;
      if (!useUiStore.getState().hasShownChecklistPopup) {
        setShownChecklistPopup();
        if (checklistItemsRef.current.length > 0) {
          setChecklistOpen(true);
          preOpened = true;
        }
      }

      if (preOpened) {
        pendingPostActivityOpenRef.current = true;
      } else {
        openPostActivityChecklist();
      }
    });
  }, [
    myEmpId,
    loaded,
    checklistLoading,
    postActivityChecklistLoading,
    hasShownChecklistPopup,
    hasShownPostActivityChecklistPopup,
    setShownChecklistPopup,
    setShownPostActivityChecklistPopup,
    checklistItemsRef,
    postActivityChecklistItemsRef,
    openPostActivityChecklist,
  ]);

  const handleHistoryDetailClose = () => {
    setHistoryDetail(null);
  };

  const menuItems = useMemo<MenuItem[]>(() => {
    const base = isAdmin
      ? { ...BASE_MENU_MAP, admin: ADMIN_MENU }
      : BASE_MENU_MAP;

    return Object.keys(base)
      .map((id) => {
        const cfg = menuConfig[id];
        const isLoading = !loaded;
        const disabled = isLoading
          ? true
          : cfg?.disabled !== undefined
            ? cfg.disabled
            : (DEFAULT_MENU_DISABLED[id] ?? false);

        return {
          ...base[id],
          order: cfg?.order ?? DEFAULT_ORDER[id] ?? 999,
          badge: cfg?.badge,
          disabled,
          hidden: cfg?.hidden ?? false,
          loading: isLoading,
        };
      })
      .filter((item) => !item.hidden)
      .sort((a, b) => a.order - b.order);
  }, [menuConfig, isAdmin, loaded]);

  const handleClick = (id: string, disabled: boolean) => {
    if (disabled) return;

    const path = PATH_MAP[id];
    if (!path) return;
    navigate(path);
  };

  return (
    <Layout padding="compact">
      <MenuHeaderRow>
        <BellSpacer />
        <MenuTitleText>또랑 메뉴🎳</MenuTitleText>
        <BellBtn onClick={() => setHistorySheetOpen(true)} aria-label="알림함">
          <Bell size={16} />
          <AnimatePresence>
            {unreadCount > 0 && (
              <BellCountBadge
                key="bell-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {unreadCount > 99 ? '99' : unreadCount}
              </BellCountBadge>
            )}
          </AnimatePresence>
        </BellBtn>
      </MenuHeaderRow>

      <MenuGrid>
        {menuItems.map(({ id, label, icon, badge, disabled, loading }, index) => (
          <MotionMenuCard
            key={id}
            disabled={disabled}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04, ease: 'easeOut' }}
            transformTemplate={(_, t) => `translateZ(0) ${t}`}
            whileTap={disabled ? undefined : { scale: 0.98 }}
            onPointerUp={(e) => { e.preventDefault(); if (e.isPrimary) handleClick(id, disabled); }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <IconWrapper style={{ opacity: loading ? 0.55 : 1 }}>
              {icon}
              <BadgeSlot>
                <AnimatePresence>
                  {!loading && badge?.text && (
                    <MenuBadge
                      key="menu-badge"
                      bg={badge.color}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      {badge.text}
                    </MenuBadge>
                  )}
                </AnimatePresence>
              </BadgeSlot>
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

      <MessageModal
        isOpen={autoShowQueue.length > 0}
        message={autoShowQueue[0] ?? null}
        empId={myEmpId}
        queuePosition={queueTotalRef.current - autoShowQueue.length + 1}
        queueLength={queueTotalRef.current}
        onClose={handleMessagePopupClose}
        onDismiss={handleMessagePopupClose}
      />

      <NotificationHistorySheet
        open={historySheetOpen}
        history={history}
        onClose={() => setHistorySheetOpen(false)}
        onSelectMessage={setHistoryDetail}
      />

      <MessageModal
        isOpen={!!historyDetail}
        message={historyDetail}
        empId={myEmpId}
        alreadyRead={historyDetail?.read}
        queuePosition={1}
        queueLength={1}
        onClose={handleHistoryDetailClose}
        onDismiss={handleHistoryDetailClose}
      />

      <ChecklistPopupModal
        isOpen={checklistOpen}
        items={checklistItems}
        onClose={() => {
          setChecklistOpen(false);
          if (pendingPostActivityOpenRef.current) {
            pendingPostActivityOpenRef.current = false;
            openPostActivityChecklist();
          }
        }}
      />

      <ChecklistPopupModal
        isOpen={postActivityChecklistOpen}
        items={postActivityChecklistItems}
        onClose={() => setPostActivityChecklistOpen(false)}
        title="활동 후 체크리스트"
        subtitle="이번 달 활동 마무리가 아직 안됐어요"
        doneSubtitle="이번 달 활동을 깔끔하게 마무리했어요"
      />
    </Layout>
  );
};

export default MainMenu;
