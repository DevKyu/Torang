import { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import useUserInfo from '../hooks/useUserInfo';
import { useQuarterStats } from '../hooks/useQuarterStats';
import {
  monthToQuarter,
  quarterList,
  calcOverallAvg,
  asMonth,
} from '../utils/score';

import { setTargetScore } from '../services/firebase';

import type {
  Month,
  Year,
  UserInfo,
  UserScores,
  UserTargets,
} from '../types/UserInfo';

import RadixSelect from '../components/RadixSelect';
import MiniTrendChart from '../components/MiniTrendChart';
import ScoreDialog from '../components/ScoreDialog';

import {
  MyInfoContainer,
  MyInfoBox,
  InfoSection,
  InfoRow,
  Label,
  Badge,
  TargetBadge,
  InfoDivider,
  ScoreContainer,
  CardCenter,
  FilterRow,
  ScoreGrid,
  ScoreItem,
  MonthLabel,
  LabelEmoji,
  Score,
  DiffBadge,
  TrendChartWrapper,
} from '../styles/myInfoStyle';
import { SmallText } from '../styles/commonStyle';
import { toast } from 'react-toastify';

const THIS_YEAR = String(new Date().getFullYear()) as Year;
const today = new Date();
const CUR_YEAR = String(today.getFullYear());
const CUR_MONTHN = today.getMonth() + 1;

type MonthCardProps = {
  month: string;
  score?: number;
  target?: number;
  onEditTarget?: () => void;
} & HTMLMotionProps<'button'>;

const MonthCard = ({
  month,
  score,
  target,
  onEditTarget,
  ...rest
}: MonthCardProps) => (
  <ScoreItem
    {...rest}
    type="button"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.16 }}
  >
    {target !== undefined && (
      <TargetBadge
        onClick={(e) => {
          e.stopPropagation();
          onEditTarget?.();
        }}
      >
        🎯 {target}
      </TargetBadge>
    )}
    <CardCenter>
      <MonthLabel>{month}월</MonthLabel>
      <Score highlight={score !== undefined}>{score ?? '-'}</Score>
    </CardCenter>
  </ScoreItem>
);

type MonthCellProps = {
  meta: {
    month: string;
    key: Month;
    score?: number;
    target?: number;
    edit: boolean;
  };
  overallAvg: number | null;
  onSave: (val: number, key: Month) => void;
};

const MonthCell = ({ meta, overallAvg, onSave }: MonthCellProps) => {
  const { month, key, score, target, edit } = meta;

  if (target !== undefined) {
    return (
      <ScoreDialog
        monthLabel={`${month}월 목표`}
        defaultValue={target}
        minScore={overallAvg ?? 50}
        onSave={(val) => onSave(val, key)}
        trigger={(open) => (
          <MonthCard
            month={month}
            score={score}
            target={target}
            onEditTarget={open}
          />
        )}
      />
    );
  }

  if (edit) {
    return (
      <ScoreDialog
        monthLabel={`${month}월 목표`}
        defaultValue={score}
        minScore={overallAvg ?? 0}
        onSave={(val) => onSave(val, key)}
      >
        <MonthCard month={month} score={score} />
      </ScoreDialog>
    );
  }

  return <MonthCard month={month} score={score} target={target} />;
};

type TrendProps = {
  show: boolean;
  avgCur: number;
  avgPrev: number | null;
  diff: number;
  color: string;
  months: readonly string[];
  year: Year;
  scores: UserScores;
};

const TrendBlock = ({
  show,
  avgCur,
  avgPrev,
  diff,
  color,
  months,
  year,
  scores,
}: TrendProps) => {
  if (!show) return null;
  return (
    <motion.div style={{ marginTop: 15 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <div style={{ fontSize: 13, display: 'flex', gap: 4 }}>
          <span>분기 평균</span>
          <strong style={{ color: '#2563eb' }}>{avgCur}</strong>
          <span>점</span>
        </div>
        {avgPrev !== null && (
          <DiffBadge color={color}>
            {diff > 0 ? '▲' : diff < 0 ? '▼' : '―'}&nbsp;{Math.abs(diff)}
          </DiffBadge>
        )}
      </div>
      <TrendChartWrapper>
        <MiniTrendChart
          data={months.map((m) => scores[year]?.[asMonth(m)] ?? null)}
          color={color}
        />
      </TrendChartWrapper>
    </motion.div>
  );
};

const MyInfo = () => {
  const nav = useNavigate();
  const userInfo = useUserInfo() ?? ({} as UserInfo);

  const [year, setYear] = useState<Year>(THIS_YEAR);
  const [quarter, setQuarter] = useState(monthToQuarter(today.getMonth()));
  const [optimisticTargets, setOptimisticTargets] = useState<UserTargets>({});

  const { name = '또랑', pin = 0, type = '' } = userInfo;
  const scores: UserScores = userInfo.scores ?? {};
  const targets: UserTargets = userInfo.targets ?? {};

  const typeLabel =
    type === 'Member' ? '정회원' : type === 'Associate' ? '준회원' : '회원';

  const { months, avgCur, avgPrev, validCount } = useQuarterStats(
    scores,
    year,
    quarter,
  );

  const yearOptions = useMemo<Year[]>(() => {
    const set = new Set<Year>([THIS_YEAR, ...(Object.keys(scores) as Year[])]);
    return [...set].sort((a, b) => +b - +a);
  }, [scores]);

  const monthMeta = useMemo(() => {
    const baseYear = targets[year] ?? {};
    const optYear = optimisticTargets[year] ?? {};

    return months.map((m) => {
      const key = asMonth(m);
      const score = scores[year]?.[key];
      const target = optYear[key] ?? baseYear[key];
      const hasT = target !== undefined;
      const edit = year === CUR_YEAR && +key === CUR_MONTHN && !hasT;
      return { month: m, key, score, target, edit };
    });
  }, [months, year, scores, targets, optimisticTargets]);

  const trend = useMemo(() => {
    const hasCur = avgCur !== null && validCount >= 2;
    const hasPrev = avgPrev !== null;

    const diff = hasPrev ? avgCur! - avgPrev! : 0;

    const color = !hasPrev
      ? '#666'
      : diff > 0
        ? '#16a34a'
        : diff < 0
          ? '#dc2626'
          : '#666';

    return { show: hasCur, diff, color };
  }, [validCount, avgCur, avgPrev]);

  const handleSave = useCallback(
    async (v: number, key: Month) => {
      setOptimisticTargets((prev) => ({
        ...prev,
        [year]: { ...(prev[year] ?? {}), [key]: v },
      }));

      try {
        await setTargetScore(year, key, v);
        toast.success(`${key}월 목표 점수를 저장했어요.`);
      } catch (e: any) {
        setOptimisticTargets((prev) => {
          const copy = { ...prev };
          if (copy[year]) delete copy[year][key];
          return copy;
        });
        toast.error(`${key}월 목표 점수 저장을 실패했어요.`);
      }
    },
    [year],
  );

  const overallAvg = useMemo(() => calcOverallAvg(scores), [scores]);

  return (
    <MyInfoContainer>
      <MyInfoBox>
        <h2>내 정보</h2>

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
              onChange={(v) => setQuarter(v as any)}
              center
              minWidth={84}
            />
          </FilterRow>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${year}-${quarter}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <ScoreGrid>
                {monthMeta.map((m) => (
                  <MonthCell
                    key={m.month}
                    meta={m}
                    overallAvg={overallAvg}
                    onSave={handleSave}
                  />
                ))}
              </ScoreGrid>

              <TrendBlock
                show={trend.show}
                avgCur={avgCur!}
                avgPrev={avgPrev}
                diff={trend.diff}
                color={trend.color}
                months={months}
                year={year}
                scores={scores}
              />
            </motion.div>
          </AnimatePresence>

          <SmallText
            top="middle"
            onClick={() => nav('/menu', { replace: true })}
          >
            돌아가기
          </SmallText>
        </ScoreContainer>
      </MyInfoBox>
    </MyInfoContainer>
  );
};

export default MyInfo;
