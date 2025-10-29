import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

import { useActivityDates } from '../hooks/useActivityDates';
import { useLoading } from '../contexts/LoadingContext';
import {
  getCurrentUserData,
  incrementUserPins,
  saveAchievements,
} from '../services/firebase';
import { checkAllAchievements } from '../utils/checkAllAchievements';

import {
  achievementGroups,
  type AchievementCategory,
  type AchievementId,
  type AchievementResult,
} from '../types/achievement';

import { CUR_MONTHN } from '../constants/date';
import { MyInfoContainer, MyInfoBox } from '../styles/myInfoStyle';
import { SmallText } from '../styles/commonStyle';
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
} from '../styles/achievementStyle';
import { containerVariants, cardVariants } from '../styles/achievementVariants';
import { Check } from 'lucide-react';
import { showAchievementWithPinToast } from '../utils/toast';

const getTodayYmd = (): number => {
  const d = new Date();
  return Number(
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
      d.getDate(),
    ).padStart(2, '0')}`,
  );
};

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
  const { showLoading, hideLoading } = useLoading();
  const { maps: activityMaps, loading: activityLoading } = useActivityDates();

  const [activeTab, setActiveTab] =
    useState<AchievementCategory>('participation');
  const [achievements, setAchievements] = useState<AchievementResult>({});
  const refs = useRef(new Map<AchievementCategory, HTMLDivElement | null>());

  useEffect(() => {
    if (activityLoading) return;

    const init = async () => {
      showLoading();
      try {
        const user = await getCurrentUserData();
        if (!user) return;

        const existing = user.achievements ?? {};
        const lastCheck = user.lastAchievementCheck ?? null;
        const todayYmd = getTodayYmd();

        const curYear = String(new Date().getFullYear());
        const curMonth = String(CUR_MONTHN);
        const activityYmd = activityMaps[curYear]?.[curMonth];

        const shouldRun =
          Object.keys(existing).length === 0 ||
          (activityYmd &&
            todayYmd > Number(activityYmd) &&
            String(todayYmd) !== lastCheck);

        if (shouldRun) {
          const newResults = await checkAllAchievements(user, existing);
          const merged = { ...existing, ...newResults };

          if (Object.keys(newResults).length > 0) {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { x: 0.5, y: 0.6 },
              scalar: 1,
              ticks: 200,
              colors: ['#22c55e', '#3b82f6', '#facc15'],
            });
            showAchievementWithPinToast(0.5);
            await incrementUserPins(0.5);
            await saveAchievements(merged, String(todayYmd), true);
            setAchievements(merged);
          } else {
            setAchievements(existing);
          }
        } else {
          setAchievements(existing);
        }

        if (achievementGroups.length > 0) {
          setActiveTab(achievementGroups[0].category);
        }
      } catch (e) {
        console.error('[Achievements:init] error:', e);
      } finally {
        hideLoading();
      }
    };

    init();
  }, [activityLoading, activityMaps]);

  useEffect(() => {
    let ticking = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const visible = entries.find((e) => e.isIntersecting);
            if (visible) {
              const id = visible.target.getAttribute(
                'data-category',
              ) as AchievementCategory;
              if (id) setActiveTab(id);
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      {
        root: null,
        rootMargin: '-10% 0px -40% 0px',
        threshold: 0.2,
      },
    );

    achievementGroups.forEach((g) => {
      const el = refs.current.get(g.category);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const setRef = useCallback(
    (key: AchievementCategory) => (el: HTMLDivElement | null) => {
      refs.current.set(key, el);
    },
    [],
  );

  const scrollTo = useCallback((key: AchievementCategory) => {
    refs.current.get(key)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  return (
    <MyInfoContainer>
      <MyInfoBox variant="achievements">
        <h2>내 업적</h2>

        <TabBar>
          {achievementGroups.map((g) => (
            <TabButton
              key={g.category}
              active={activeTab === g.category}
              onClick={() => scrollTo(g.category)}
            >
              {g.title}
            </TabButton>
          ))}
        </TabBar>

        <GridScrollContainer>
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
