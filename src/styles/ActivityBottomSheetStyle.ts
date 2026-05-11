import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const SheetWrapper = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 15000;
`;

export const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
  touch-action: none;
`;

export const Sheet = styled(motion.div)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  height: auto;
  max-height: 70vh;

  background: #fff;
  border-radius: 16px 16px 0 0;

  display: flex;
  flex-direction: column;

  will-change: transform;
  transform: translateZ(0);
  touch-action: pan-y;
`;

export const Handle = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: #c4c9d4;
  margin: 12px auto 0;
`;

export const Content = styled.div`
  flex: 1;
  min-height: 0;
  padding: 14px 20px 28px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
`;

export const Title = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
`;

export const Delta = styled.div<{ positive: boolean; draw?: boolean }>`
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
  padding-top: 2px;
  color: ${({ draw, positive }) => draw ? '#d97706' : positive ? '#2563eb' : '#dc2626'};
`;

export const Month = styled.div`
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  color: #9ca3af;
  padding-top: 3px;
`;

export const TeamsRow = styled.div`
  display: flex;
  gap: 2px;
  border-radius: 12px;
  overflow: hidden;
`;

type TeamStatus = 'winner' | 'loser' | 'neutral';

const teamBg: Record<TeamStatus, string> = {
  winner:  'linear-gradient(to bottom, #eff6ff, #ffffff)',
  loser:   'linear-gradient(to bottom, #fef2f2, #ffffff)',
  neutral: 'linear-gradient(to bottom, #fffbeb, #ffffff)',
};
const teamBorder: Record<TeamStatus, string> = {
  winner: '#3b82f6',
  loser:  '#f87171',
  neutral: '#fcd34d',
};
const teamLabelColor: Record<TeamStatus, string> = {
  winner: '#2563eb',
  loser:  '#dc2626',
  neutral: '#b45309',
};
const teamScoreColor: Record<TeamStatus, string> = {
  winner: '#1d4ed8',
  loser:  '#b91c1c',
  neutral: '#92400e',
};

export const TeamBlock = styled.div<{ status?: TeamStatus }>`
  flex: 1;
  padding: 14px 12px 16px;
  background: ${({ status = 'neutral' }) => teamBg[status]};
  border-top: 3px solid ${({ status = 'neutral' }) => teamBorder[status]};
  border-radius: 10px;
`;

export const TeamLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

export const TeamLabel = styled.span<{ status?: TeamStatus }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ status = 'neutral' }) => teamLabelColor[status]};
  letter-spacing: 0.2px;
`;

export const TeamScoreNum = styled.span<{ status?: TeamStatus }>`
  font-size: 24px;
  font-weight: 800;
  color: ${({ status = 'neutral' }) => teamScoreColor[status]};
  line-height: 1;
`;

type RewardCategory = 'activity' | 'achievement' | 'target' | 'match' | 'referral' | 'gallery' | 'mission';

const categoryStyle: Record<RewardCategory, { bg: string; color: string }> = {
  activity:    { bg: '#f0fdf4', color: '#16a34a' },
  achievement: { bg: '#fffbeb', color: '#d97706' },
  target:      { bg: '#eff6ff', color: '#2563eb' },
  match:       { bg: '#f5f3ff', color: '#7c3aed' },
  referral:    { bg: '#fdf2f8', color: '#db2777' },
  gallery:     { bg: '#fff7ed', color: '#ea580c' },
  mission:     { bg: '#f0f9ff', color: '#0284c7' },
};

export const RewardBadge = styled.div<{ category: RewardCategory }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
  background: ${({ category }) => categoryStyle[category].bg};
  color: ${({ category }) => categoryStyle[category].color};
`;

export const Desc = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
`;

export const TargetScoreRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0 14px;
`;

export const TargetArrow = styled.div`
  flex-shrink: 0;
  font-size: 14px;
  color: #d1d5db;
`;

export const TargetScoreBox = styled.div<{ variant: 'goal' | 'regular' | 'special' }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 14px 12px;
  border-radius: 14px;
  background: ${({ variant }) =>
    variant === 'goal' ? '#f9fafb' : variant === 'special' ? '#faf5ff' : '#f0fdf4'};
  border-top: 3px solid ${({ variant }) =>
    variant === 'goal' ? '#e5e7eb' : variant === 'special' ? '#d8b4fe' : '#86efac'};
`;

export const TargetScoreLabel = styled.div<{ variant: 'goal' | 'regular' | 'special' }>`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  color: ${({ variant }) =>
    variant === 'goal' ? '#9ca3af' : variant === 'special' ? '#c084fc' : '#4ade80'};
`;

export const TargetScoreValue = styled.div<{ variant: 'goal' | 'regular' | 'special' }>`
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: ${({ variant }) =>
    variant === 'goal' ? '#374151' : variant === 'special' ? '#9333ea' : '#16a34a'};
`;

export const TargetScoreUnit = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: inherit;
  opacity: 0.7;
`;

export const TargetDelta = styled.div<{ special: boolean }>`
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 14px;
  color: ${({ special }) => (special ? '#9333ea' : '#16a34a')};
`;

export const DateLine = styled.div`
  font-size: 12px;
  color: #9ca3af;
  margin-top: 14px;
  text-align: center;
`;

export const LeaguePlayerRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  line-height: 1.5;
`;

export const ScoreGroup = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const ScoreVal = styled.span`
  min-width: 3ch;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #9ca3af;
`;

export const ScoreSep = styled.span`
  padding: 0 2px;
  font-size: 11px;
  color: #d1d5db;
`;

const playerScoreColor: Record<TeamStatus, string> = {
  winner:  '#3b82f6',
  loser:   '#f87171',
  neutral: '#d97706',
};

export const LeaguePlayerScore = styled.span<{ status?: TeamStatus }>`
  min-width: 3ch;
  text-align: right;
  font-size: 12px;
  color: ${({ status = 'neutral' }) => playerScoreColor[status]};
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

export const TeamDivider = styled.div`
  height: 1px;
  background: rgba(0, 0, 0, 0.07);
  margin: 8px 0 6px;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

type StatKind = 'photos' | 'likes' | 'comments' | 'achievements';

const statKindStyle: Record<StatKind, { bg: string; accent: string; color: string }> = {
  photos:       { bg: '#eff6ff', accent: '#3b82f6', color: '#2563eb' },
  likes:        { bg: '#fdf2f8', accent: '#ec4899', color: '#db2777' },
  comments:     { bg: '#f0fdf4', accent: '#22c55e', color: '#16a34a' },
  achievements: { bg: '#fffbeb', accent: '#f59e0b', color: '#d97706' },
};

export const StatItem = styled.div<{ kind: StatKind }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px 14px;
  background: #f9fafb;
  border-radius: 12px;
  border-top: 3px solid ${({ kind }) => statKindStyle[kind].accent};
  gap: 3px;
`;

export const StatEmoji = styled.div`
  font-size: 20px;
  line-height: 1;
  margin-bottom: 4px;
`;

export const StatValue = styled.div<{ kind: StatKind }>`
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  color: ${({ kind }) => statKindStyle[kind].color};
`;

export const StatLabel = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  margin-top: 2px;
`;
