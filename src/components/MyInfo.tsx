import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNavigateBack } from '../hooks/useNavigateBack';
import { toast } from 'sonner';

import useUserInfo from '../hooks/useUserInfo';
import { useActivityDates } from '../hooks/useActivityDates';
import { useQuarterStats } from '../hooks/useQuarterStats';
import { useTargetResult } from '../hooks/useTargetResult';
import {
  monthToQuarter,
  quarterList,
  calcOverallAvg,
  asMonth,
} from '../utils/score';
import { getTypeLabel } from '../utils/user';
import { canEditTarget } from '../utils/policy';
import { getCurrentUserId, setTargetScore } from '../services/firebase';
import RadixSelect from '../components/RadixSelect';
import MonthCell from './MonthCell';
import TrendBlock from './TrendBlock';
import CongratulationOverlay from './CongratulationOverlay';
import { useUiStore } from '../stores/useUiStore';
import {
  MyInfoContainer,
  MyInfoBox,
  InfoSection,
  InfoRow,
  Label,
  Badge,
  InfoDivider,
  ScoreContainer,
  FilterRow,
  ScoreGrid,
  LabelEmoji,
  BadgeButton,
  SkeletonBadge,
  SkeletonScoreGrid,
  SkeletonScoreItem,
} from '../styles/myInfoStyle';
import { SmallText, Title } from '../styles/commonStyle';
import { ChevronRight } from 'lucide-react';
import type {
  Month,
  Year,
  UserScores,
  UserTargets,
} from '../types/UserInfo';
import { grantTargetPinReward } from '../utils/pin';
import { useEventStore } from '../stores/eventStore';

const MyInfo = () => {
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const userInfo = useUserInfo();
  const isUserReady = userInfo !== null;
  const { name = '', pin = 0, type = '' } = userInfo ?? {};

  const { formatServerDate } = useUiStore.getState();
  const serverYear = formatServerDate('year') as Year;
  const serverMonth = Number(formatServerDate('month'));
  const serverYm = formatServerDate('ym');

  const [year, setYear] = useState<Year>(serverYear);
  const [quarter, setQuarter] = useState(monthToQuarter(serverMonth));
  const [optimisticTargets, setOptimisticTargets] = useState<UserTargets>({});

  const scores: UserScores = userInfo?.scores ?? {};
  const targets: UserTargets = userInfo?.targets ?? {};
  const typeLabel = getTypeLabel(type);

  const { maps: activityAll, loading: activityLoading } = useActivityDates();
  const activityMap = activityAll[String(year)] ?? {};
  const isReady = isUserReady && !activityLoading;

  const { hasShownCongrats, setShownCongrats } = useUiStore();
  const hasMyInfoCongrats = hasShownCongrats.myInfo;

  const { months, avgCur, avgPrev, validCount } = useQuarterStats(
    scores,
    year,
    quarter,
  );

  const yearNum = Number(serverYear);
  const monthNum = serverMonth;
  let activityYmd = activityAll[String(yearNum)]?.[String(monthNum)];
  if (!activityYmd) {
    const prevMonth = monthNum === 1 ? 12 : monthNum - 1;
    const prevYear = monthNum === 1 ? yearNum - 1 : yearNum;
    activityYmd = activityAll[String(prevYear)]?.[String(prevMonth)];
  }

  const activityYmdStr = activityYmd ? String(activityYmd) : undefined;
  const activityYm = activityYmdStr?.slice(0, 6) ?? serverYm;
  const targetResult = useTargetResult(userInfo, activityYmdStr, 7);
  const isPinRewardEnabled = useEventStore((s) => s.isPinRewardEnabled);

  const yearOptions = useMemo<Year[]>(() => {
    const allYears = new Set(Object.keys(scores) as Year[]);
    allYears.add(serverYear);
    return Array.from(allYears).sort((a, b) => +b - +a);
  }, [scores, serverYear]);

  const monthMeta = useMemo(() => {
    const baseYear = targets[year] ?? {};
    const optYear = optimisticTargets[year] ?? {};
    return months.map((m) => {
      const key = asMonth(m);
      const score = scores[year]?.[key];
      const target = optYear[key] ?? baseYear[key];
      const hasTarget = target !== undefined;
      const isEditable =
        year === serverYear && +key === serverMonth && !hasTarget;
      return { month: m, key, score, target, edit: isEditable };
    });
  }, [
    months,
    year,
    scores,
    targets,
    optimisticTargets,
    serverYear,
    serverMonth,
  ]);

  const trend = useMemo(() => {
    const hasCur = avgCur !== null && validCount >= 2;
    const hasPrev = avgPrev !== null;
    const diff = hasPrev ? avgCur! - avgPrev! : 0;
    const color = !hasPrev
      ? '#666'
      : diff > 0
        ? '#dc2626'
        : diff < 0
          ? '#2563eb'
          : '#666';
    return { show: hasCur, diff, color };
  }, [validCount, avgCur, avgPrev]);

  const rollbackTarget = useCallback(
    (key: Month) => {
      setOptimisticTargets((prev) => {
        const copy = { ...prev };
        if (copy[year]) delete copy[year][key];
        return copy;
      });
    },
    [year],
  );

  const handleSave = useCallback(
    async (v: number, key: Month) => {
      setOptimisticTargets((prev) => ({
        ...prev,
        [year]: { ...(prev[year] ?? {}), [key]: v },
      }));

      try {
        await setTargetScore(year, key, v);
        toast.success(`${key}월 목표 점수를 저장했어요.`);
      } catch {
        rollbackTarget(key);
        toast.error(`${key}월 목표 점수 저장에 실패했어요.`);
      }
    },
    [year, rollbackTarget],
  );

  useEffect(() => {
    if (!targetResult.show || !targetResult.achieved) return;
    if (!isPinRewardEnabled('targetScore')) return;
    if (!activityYmdStr) return;

    const { myScore, target, special } = targetResult;
    if (myScore == null || target == null) return;

    const empId = getCurrentUserId();
    if (!empId) return;

    grantTargetPinReward({
      empId,
      ym: activityYm,
      activityYmd: activityYmdStr,
      payload: {
        myScore,
        target,
        achieved: true,
        special,
      },
    });
  }, [
    targetResult.show,
    targetResult.achieved,
    targetResult.myScore,
    targetResult.target,
    targetResult.special,
    activityYmdStr,
    isPinRewardEnabled,
    activityYm,
  ]);

  const overallAvg = useMemo(() => calcOverallAvg(scores), [scores]);

  return (
    <MyInfoContainer>
      <MyInfoBox>
        <Title size="small">내 정보</Title>

        <InfoSection>
          <InfoRow>
            <LabelEmoji>👤</LabelEmoji>
            <Label>이름</Label>
            {isReady ? <Badge>{name}</Badge> : <SkeletonBadge />}
          </InfoRow>
          <InfoRow>
            <LabelEmoji>🏷️</LabelEmoji>
            <Label>회원 구분</Label>
            {isReady ? <Badge>{typeLabel}</Badge> : <SkeletonBadge />}
          </InfoRow>
          <AnimatePresence>
            {(!isReady || overallAvg !== null) && (
              <motion.div
                key="avg-row"
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ overflow: 'hidden' }}
              >
                <InfoRow style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <LabelEmoji>📊</LabelEmoji>
                  <Label>평균 점수</Label>
                  {isReady ? <Badge>{overallAvg}점</Badge> : <SkeletonBadge />}
                </InfoRow>
              </motion.div>
            )}
          </AnimatePresence>
          <InfoRow>
            <LabelEmoji>🎳</LabelEmoji>
            <Label>또랑핀</Label>
            {isReady ? <Badge>{pin}개</Badge> : <SkeletonBadge />}
          </InfoRow>
          <InfoRow>
            <LabelEmoji>🏅</LabelEmoji>
            <Label>업적</Label>
            <BadgeButton onClick={() => navigate('/achievements')}>
              업적 보기 <ChevronRight size={14} strokeWidth={2} />
            </BadgeButton>
          </InfoRow>
        </InfoSection>

        <InfoDivider />

        <ScoreContainer>
          <FilterRow>
            <RadixSelect
              value={year}
              options={yearOptions}
              onChange={(v) => setYear(v as Year)}
              center
              minWidth={96}
            />
            <RadixSelect
              value={quarter}
              options={quarterList}
              onChange={(v) => setQuarter(v as typeof quarter)}
              center
              minWidth={84}
            />
          </FilterRow>

          {!isReady ? (
            <SkeletonScoreGrid>
              {[0, 1, 2].map((i) => <SkeletonScoreItem key={i} />)}
            </SkeletonScoreGrid>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                <ScoreGrid
                  key={`${year}-${quarter}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {monthMeta.map((m) => {
                    const raw = activityMap[+m.key];
                    const actYmd = raw ? String(raw) : undefined;
                    const timeAllowed = canEditTarget(actYmd, {
                      cutoffTime: '18:30',
                    });
                    const hasActivity = !!actYmd;
                    const isCurrentMonth =
                      year === serverYear && +m.key === serverMonth;
                    const highlightActivity = isCurrentMonth && hasActivity;

                    return (
                      <MonthCell
                        key={`${year}-${m.key}`}
                        meta={m}
                        overallAvg={overallAvg}
                        onSave={handleSave}
                        timeAllowed={timeAllowed}
                        highlightActivity={highlightActivity}
                        hasActivity={hasActivity}
                      />
                    );
                  })}
                </ScoreGrid>
              </AnimatePresence>

              <AnimatePresence>
                {trend.show && (
                  <TrendBlock
                    key="trend"
                    avgCur={avgCur ?? 0}
                    avgPrev={avgPrev}
                    diff={trend.diff}
                    color={trend.color}
                    months={months}
                    year={year}
                    scores={scores}
                  />
                )}
              </AnimatePresence>
            </>
          )}

          <SmallText
            top="middle"
            onClick={() => {
              if (!isReady) return;
              goBack();
            }}
          >
            돌아가기
          </SmallText>
        </ScoreContainer>
      </MyInfoBox>

      <CongratulationOverlay
        open={targetResult.show && !hasMyInfoCongrats}
        mainResult={
          targetResult.special
            ? 'special'
            : targetResult.achieved
              ? 'win'
              : 'lose'
        }
        message={[
          targetResult.special
            ? `목표와 동일한 점수 달성!`
            : targetResult.achieved
              ? `목표 달성!`
              : `목표 미달성`,
        ]}
        score={targetResult.myScore}
        delta={
          targetResult.myScore && targetResult.target
            ? targetResult.myScore - targetResult.target
            : undefined
        }
        durationMs={2500}
        onClose={() => {
          targetResult.setShow(false);
          setShownCongrats('myInfo');
        }}
      />
    </MyInfoContainer>
  );
};

export default MyInfo;
