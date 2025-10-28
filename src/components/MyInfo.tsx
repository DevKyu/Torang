import { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
import { toYmd, canEditTarget } from '../utils/policy';

import { THIS_YEAR, CUR_YEAR, CUR_MONTHN } from '../constants/date';

import type {
  Month,
  Year,
  UserInfo,
  UserScores,
  UserTargets,
} from '../types/UserInfo';

import { setTargetScore } from '../services/firebase';

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
} from '../styles/myInfoStyle';
import { SmallText } from '../styles/commonStyle';
import { getYearMonth } from '../utils/date';
import { ChevronRight } from 'lucide-react';

const MyInfo = () => {
  const navigate = useNavigate();
  const userInfo = useUserInfo() ?? ({} as UserInfo);
  const { name = '게스트', pin = 0, type = '' } = userInfo;

  const [year, setYear] = useState<Year>(THIS_YEAR);
  const [quarter, setQuarter] = useState(monthToQuarter(new Date().getMonth()));
  const [optimisticTargets, setOptimisticTargets] = useState<UserTargets>({});

  const scores: UserScores = userInfo.scores ?? {};
  const targets: UserTargets = userInfo.targets ?? {};
  const typeLabel = getTypeLabel(type);
  const { maps: activityAll, loading: activityLoading } = useActivityDates();
  const activityMap = activityAll[String(year)] ?? {};
  const todayYmd = toYmd(new Date());

  const { hasShownCongrats, setShownCongrats } = useUiStore();
  const hasMyInfoCongrats = hasShownCongrats.myInfo;

  const { months, avgCur, avgPrev, validCount } = useQuarterStats(
    scores,
    year,
    quarter,
  );

  const yearOptions = useMemo<Year[]>(() => {
    const allYears = new Set(Object.keys(scores) as Year[]);
    allYears.add(THIS_YEAR);
    return Array.from(allYears).sort((a, b) => +b - +a);
  }, [scores]);

  const monthMeta = useMemo(() => {
    const baseYear = targets[year] ?? {};
    const optYear = optimisticTargets[year] ?? {};

    return months.map((m) => {
      const key = asMonth(m);
      const score = scores[year]?.[key];
      const target = optYear[key] ?? baseYear[key];
      const hasTarget = target !== undefined;
      const isEditable = year === CUR_YEAR && +key === CUR_MONTHN && !hasTarget;
      return { month: m, key, score, target, edit: isEditable };
    });
  }, [months, year, scores, targets, optimisticTargets]);

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
        toast.error(`${key}월 목표 점수 저장을 실패했어요.`);
      }
    },
    [year, rollbackTarget],
  );

  const overallAvg = useMemo(() => calcOverallAvg(scores), [scores]);

  const ym = getYearMonth();
  const raw = activityMap[String(CUR_MONTHN)];
  const activityYmd = raw != null ? String(raw) : undefined;
  const targetResult = useTargetResult(userInfo, ym, activityYmd, 7);

  const renderUserInfo = () => (
    <InfoSection>
      <InfoRow>
        <LabelEmoji>👤</LabelEmoji>
        <Label>이름</Label>
        <Badge>{name}</Badge>
      </InfoRow>
      <InfoRow>
        <LabelEmoji>🏷️</LabelEmoji>
        <Label>회원 구분</Label>
        <Badge>{typeLabel}</Badge>
      </InfoRow>
      {overallAvg !== null && (
        <InfoRow>
          <LabelEmoji>📊</LabelEmoji>
          <Label>평균 점수</Label>
          <Badge>{overallAvg}점</Badge>
        </InfoRow>
      )}
      <InfoRow>
        <LabelEmoji>🎳</LabelEmoji>
        <Label>또랑핀</Label>
        <Badge>{pin}개</Badge>
      </InfoRow>
      <InfoRow>
        <LabelEmoji>🏅</LabelEmoji>
        <Label>업적</Label>
        <BadgeButton
          onClick={() => navigate('/achievements', { replace: true })}
        >
          업적 보기 <ChevronRight size={14} strokeWidth={2} />
        </BadgeButton>
      </InfoRow>
    </InfoSection>
  );

  const renderScoreSection = () => (
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

      {activityLoading ? null : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${year}-${quarter}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <ScoreGrid>
              {monthMeta.map((m) => {
                const raw = activityMap[+m.key];
                const activityYmd = raw != null ? String(raw) : undefined;
                const timeAllowed = canEditTarget(todayYmd, activityYmd);

                const hasActivity = !!activityYmd;
                const isCurrentMonth =
                  year === CUR_YEAR && +m.key === CUR_MONTHN;
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

            <TrendBlock
              show={trend.show}
              avgCur={avgCur ?? 0}
              avgPrev={avgPrev}
              diff={trend.diff}
              color={trend.color}
              months={months}
              year={year}
              scores={scores}
            />
          </motion.div>
        </AnimatePresence>
      )}

      <SmallText
        top="middle"
        onClick={() => navigate('/menu', { replace: true })}
      >
        돌아가기
      </SmallText>
    </ScoreContainer>
  );

  return (
    <MyInfoContainer>
      <MyInfoBox>
        <h2>내 정보</h2>
        {renderUserInfo()}
        <InfoDivider />
        {renderScoreSection()}
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
