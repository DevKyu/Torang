import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

import { useActivityDates } from '../hooks/useActivityDates';
import {
  getCurrentUserData,
  getCurrentUserId,
  saveAchievements,
  waitForAuthUser,
} from '../services/firebase';
import { checkAllAchievements } from '../utils/checkAllAchievements';
import {
  achievementGroups,
  type AchievementCategory,
  type AchievementId,
  type AchievementResult,
} from '../types/achievement';

import { MyInfoContainer, MyInfoBox } from '../styles/myInfoStyle';
import { SmallText, Title } from '../styles/commonStyle';
import {
  GridScrollContainer,
  GridContainer,
  Card,
  CardIcon,
  CardTitle,
  CardDesc,
  AchievedDate,
  CategoryBlock,
  CategoryTitle,
  TabBar,
  TabButton,
  SkeletonCard,
} from '../styles/achievementStyle';
import { containerVariants, cardVariants } from '../styles/achievementVariants';
import { Check } from 'lucide-react';
import { useUiStore } from '../stores/useUiStore';
import { useEventStore } from '../stores/eventStore';
import { grantAchievementPinReward } from '../utils/pin';
import { showAchievementToast } from '../utils/toast';

const toMonthLabel = (dateStr: string): string => {
  const digits = dateStr.replace(/\D/g, '');
  if (digits.length < 6) return dateStr;
  const year = digits.slice(0, 4);
  const month = parseInt(digits.slice(4, 6), 10);
  if (isNaN(month) || month < 1 || month > 12) return dateStr;
  return `${year}년 ${month}월`;
};

const Achievements = () => {
  const navigate = useNavigate();
  const { maps: activityMaps, loading: activityLoading } = useActivityDates();

  const isPinRewardEnabled = useEventStore((s) => s.isPinRewardEnabled);

  const [activeTab, setActiveTab] =
    useState<AchievementCategory>('participation');
  const [achievements, setAchievements] = useState<AchievementResult>({});
  const [achievementsLoaded, setAchievementsLoaded] = useState(false);
  const refs = useRef(new Map<AchievementCategory, HTMLDivElement | null>());

  const { formatServerDate, isBeforeCutoff, getServerNow } = useUiStore();

  useEffect(() => {
    if (activityLoading) return;

    const init = async () => {
      try {
        await waitForAuthUser();
        const user = await getCurrentUserData();
        if (!user) return;

        const existing = user.achievements ?? {};
        const lastCheck = user.lastAchievementCheck ?? null;
        const todayYmd = Number(formatServerDate('ymd'));

        const curYear = String(getServerNow().getFullYear());
        const curMonth = String(getServerNow().getMonth() + 1);
        const activityYmd = activityMaps[curYear]?.[curMonth];

        const shouldRun =
          activityYmd &&
          !isBeforeCutoff(String(activityYmd), '18:30') &&
          String(todayYmd) !== lastCheck;

        if (!shouldRun) {
          setAchievements(existing);
          return;
        }

        const newResults = await checkAllAchievements(user, existing);
        const merged = { ...existing, ...newResults };

        if (Object.keys(newResults).length > 0) {
          const empId = getCurrentUserId();

          confetti({
            particleCount: 150,
            spread: 100,
            origin: { x: 0.5, y: 0.6 },
            scalar: 1,
            ticks: 200,
            colors: ['#22c55e', '#3b82f6', '#facc15'],
          });
          showAchievementToast();

          if (isPinRewardEnabled('achievement') && empId) {
            const activityYm = activityYmd
              ? String(activityYmd).slice(0, 6)
              : formatServerDate('ym');

            grantAchievementPinReward({
              empId,
              ym: activityYm,
              payload: { detail: Object.keys(newResults).join(', ') },
            });
          }

          await saveAchievements(merged, String(todayYmd), true);
          setAchievements(merged);
        } else {
          setAchievements(existing);
        }

        if (achievementGroups.length > 0) {
          setActiveTab(achievementGroups[0].category);
        }
      } catch {
        toast.error('데이터를 불러오지 못했어요.', { id: 'achievements-load-error' });
      } finally {
        setAchievementsLoaded(true);
      }
    };

    init();
  }, [activityLoading, activityMaps, isPinRewardEnabled]);

  useEffect(() => {
    if (!achievementsLoaded) return;

    let observer: IntersectionObserver | null = null;

    const id = window.setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.find((e) => e.isIntersecting);
          if (visible) {
            const cat = visible.target.getAttribute(
              'data-category',
            ) as AchievementCategory;
            if (cat) setActiveTab(cat);
          }
        },
        {
          root: document.querySelector('[data-scroll-container]'),
          rootMargin: '-10% 0px -40% 0px',
          threshold: 0.2,
        },
      );

      achievementGroups.forEach((g) => {
        const el = refs.current.get(g.category);
        if (el) observer!.observe(el);
      });
    }, 200);

    return () => {
      window.clearTimeout(id);
      observer?.disconnect();
    };
  }, [achievementsLoaded]);

  const setRef = useCallback(
    (key: AchievementCategory) => (el: HTMLDivElement | null) => {
      refs.current.set(key, el);
    },
    [],
  );

  const scrollTo = useCallback((key: AchievementCategory) => {
    const container = document.querySelector(
      '[data-scroll-container]',
    ) as HTMLElement | null;
    const target = refs.current.get(key);
    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const top = container.scrollTop + (targetRect.top - containerRect.top);

    container.scrollTo({
      top,
      behavior: 'smooth',
    });
  }, []);

  return (
    <MyInfoContainer>
      <MyInfoBox variant="achievements">
        <Title size="small">내 업적</Title>

        <TabBar>
          {achievementGroups.map((g) => (
            <TabButton
              key={g.category}
              active={activeTab === g.category}
              onClick={achievementsLoaded ? () => scrollTo(g.category) : undefined}
              style={achievementsLoaded ? undefined : { pointerEvents: 'none', opacity: 0.5 }}
            >
              {g.title}
            </TabButton>
          ))}
        </TabBar>

        <AnimatePresence mode="wait">
          {!achievementsLoaded ? (
            <motion.div
              key="skeleton"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <GridScrollContainer>
                {achievementGroups.map((group) => (
                  <CategoryBlock key={group.category}>
                    <CategoryTitle style={{ color: '#d1d5db' }}>
                      {group.title}
                    </CategoryTitle>
                    <GridContainer>
                      {group.items.map((item) => (
                        <SkeletonCard key={item.id} />
                      ))}
                    </GridContainer>
                  </CategoryBlock>
                ))}
              </GridScrollContainer>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <GridScrollContainer data-scroll-container>
                {achievementGroups.map((group) => {
                  const itemsWithStatus = group.items.map((a) => {
                    const record = achievements[a.id as AchievementId];
                    return { ...a, achieved: !!record, date: record?.achievedAt };
                  });

                  const done = itemsWithStatus.filter((a) => a.achieved).length;

                  return (
                    <CategoryBlock
                      key={group.category}
                      ref={setRef(group.category)}
                      data-category={group.category}
                    >
                      <CategoryTitle>
                        {group.title} ({done}/{group.items.length})
                      </CategoryTitle>

                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                      >
                        <GridContainer>
                          {itemsWithStatus.map((a) => (
                            <motion.div key={a.id} variants={cardVariants}>
                              <Card achieved={a.achieved}>
                                <CardIcon>{a.icon}</CardIcon>
                                <CardTitle>{a.label}</CardTitle>
                                <CardDesc>{a.desc}</CardDesc>
                                {a.achieved && a.date && (
                                  <AchievedDate>
                                    {toMonthLabel(a.date)}
                                    <Check
                                      size={12}
                                      strokeWidth={3}
                                      color="#22c55e"
                                      className="check-icon"
                                    />
                                  </AchievedDate>
                                )}
                              </Card>
                            </motion.div>
                          ))}
                        </GridContainer>
                      </motion.div>
                    </CategoryBlock>
                  );
                })}
              </GridScrollContainer>
            </motion.div>
          )}
        </AnimatePresence>

        <SmallText
          top="narrow"
          onClick={() => navigate('/myinfo', { replace: true })}
        >
          돌아가기
        </SmallText>
      </MyInfoBox>
    </MyInfoContainer>
  );
};

export default Achievements;
