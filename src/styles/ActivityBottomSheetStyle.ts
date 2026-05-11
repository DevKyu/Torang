import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const gpu = `transform: translate3d(0,0,0); backface-visibility: hidden;`;
type TeamStatus = 'winner' | 'loser' | 'neutral';

const teamTone = {
  winner: {
    bg: 'linear-gradient(#eff6ff, #fff)',
    border: '#3b82f6',
    label: '#2563eb',
    score: '#1d4ed8',
  },
  loser: {
    bg: 'linear-gradient(#fef2f2, #fff)',
    border: '#f87171',
    label: '#dc2626',
    score: '#b91c1c',
  },
  neutral: {
    bg: 'linear-gradient(#fffbeb, #fff)',
    border: '#fcd34d',
    label: '#b45309',
    score: '#92400e',
  },
};

const categoryTone: Record<string, { bg: string; color: string }> = {
  activity: { bg: '#f0fdf4', color: '#16a34a' },
  achievement: { bg: '#fffbeb', color: '#d97706' },
  target: { bg: '#eff6ff', color: '#2563eb' },
  match: { bg: '#f5f3ff', color: '#7c3aed' },
  referral: { bg: '#fdf2f8', color: '#db2777' },
  gallery: { bg: '#fff7ed', color: '#ea580c' },
  mission: { bg: '#f0f9ff', color: '#0284c7' },
};

const statTone: Record<string, { bg: string; border: string; color: string }> =
  {
    photos: { bg: '#eff6ff', border: '#60a5fa', color: '#2563eb' },
    likes: { bg: '#fdf2f8', border: '#f472b6', color: '#db2777' },
    comments: { bg: '#f0fdf4', border: '#4ade80', color: '#16a34a' },
    achievements: { bg: '#fffbeb', border: '#fbbf24', color: '#d97706' },
  };

export const SheetWrapper = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 15000;
  overflow: hidden;
  touch-action: none;
  ${gpu}
`;

export const Backdrop = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
  ${gpu}
`;

export const Sheet = styled(motion.div)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 85dvh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  touch-action: none;
  ${gpu}
`;

export const DragZone = styled.div`
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 12px 0 8px;
  cursor: grab;
  touch-action: none;
  user-select: none;
`;

export const Handle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.1);
`;

export const Content = styled.div`
  overflow-y: auto;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  padding: 0 20px calc(env(safe-area-inset-bottom, 0px) + 24px);
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
`;

export const Title = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #111;
`;

export const Delta = styled.div<{ positive: boolean; draw?: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${({ draw, positive }) =>
    draw ? '#d97706' : positive ? '#2563eb' : '#dc2626'};
`;

export const Month = styled.div`
  font-size: 13px;
  color: #9ca3af;
`;

export const TeamsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

export const TeamBlock = styled.div<{ status?: TeamStatus }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 14px 12px 16px;
  background: ${({ status = 'neutral' }) => teamTone[status].bg};
  border-top: 3.5px solid ${({ status = 'neutral' }) => teamTone[status].border};
  border-radius: 14px;
`;

export const TeamLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const TeamLabel = styled.div<{ status?: TeamStatus }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ status = 'neutral' }) => teamTone[status].label};
`;

export const TeamScoreNum = styled.div<{ status?: TeamStatus }>`
  font-size: 24px;
  font-weight: 800;
  color: ${({ status = 'neutral' }) => teamTone[status].score};
  line-height: 1;
`;

export const TeamDivider = styled.div`
  height: 1px;
  margin: 6px 0 10px;
  background: rgba(0, 0, 0, 0.07);
`;

export const LeaguePlayerRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
`;

export const ScoreGroup = styled.div`
  display: flex;
  align-items: center;
`;

export const ScoreVal = styled.span`
  color: #9ca3af;
  min-width: 2.8ch;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

export const ScoreSep = styled.span`
  color: #d1d5db;
  padding: 0 4px;
  font-size: 11px;
`;

export const LeaguePlayerScore = styled.span<{ status: TeamStatus }>`
  font-weight: 700;
  color: ${({ status }) => teamTone[status].label};
  min-width: 2.8ch;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

export const RewardBadge = styled.div<{ category: string }>`
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 12px;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ category }) => categoryTone[category]?.bg || '#f3f4f6'};
  color: ${({ category }) => categoryTone[category]?.color || '#6b7280'};
`;

export const Desc = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: #6b7280;
`;

export const DateLine = styled.div`
  margin-top: 14px;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

export const StatItem = styled.div<{ kind: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 14px;
  background: ${({ kind }) => statTone[kind]?.bg || '#f9fafb'};
  border-top: 3px solid ${({ kind }) => statTone[kind]?.border || '#eee'};
`;

export const StatEmoji = styled.div`
  font-size: 20px;
  margin-bottom: 4px;
`;

export const StatValue = styled.div<{ kind: string }>`
  font-size: 26px;
  font-weight: 800;
  color: ${({ kind }) => statTone[kind]?.color || '#111'};
`;

export const StatLabel = styled.div`
  font-size: 11px;
  color: #9ca3af;
`;

export const TargetScoreRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TargetArrow = styled.div`
  color: #d1d5db;
`;

export const TargetScoreBox = styled.div<{ variant: string }>`
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  text-align: center;
  background: ${({ variant }) =>
    variant === 'goal'
      ? '#f9fafb'
      : variant === 'special'
        ? '#faf5ff'
        : '#f0fdf4'};
  border-top: 3px solid
    ${({ variant }) =>
      variant === 'goal'
        ? '#e5e7eb'
        : variant === 'special'
          ? '#d8b4fe'
          : '#86efac'};
`;

export const TargetScoreLabel = styled.div<{ variant: string }>`
  font-size: 11px;
  font-weight: 700;
  color: ${({ variant }) =>
    variant === 'goal'
      ? '#9ca3af'
      : variant === 'special'
        ? '#a855f7'
        : '#22c55e'};
`;

export const TargetScoreValue = styled.div<{ variant: string }>`
  font-size: 24px;
  font-weight: 800;
  color: ${({ variant }) =>
    variant === 'goal'
      ? '#374151'
      : variant === 'special'
        ? '#9333ea'
        : '#16a34a'};
`;

export const TargetScoreUnit = styled.span`
  font-size: 12px;
  opacity: 0.7;
`;

export const TargetDelta = styled.div<{ special: boolean }>`
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: ${({ special }) => (special ? '#9333ea' : '#16a34a')};
`;
