import styled from '@emotion/styled';
import { CHEER_COLOR } from './CheerMessagesModalStyle';
import {
  SectionLabel,
  VotingInstruction,
  VoteListWrapper,
  VoteListArea,
  SubmitBtn,
  AlreadyVotedBox,
  VotedStateArea,
  VotedEmoji,
  VotedName,
  VotedHeadline,
  VotedSub,
  ResultRevealCard,
  ResultRole,
  ResultName,
  VoteActionRow,
  VoteResultBtn,
} from './MissionStyle';

export {
  SectionLabel,
  VotingInstruction,
  VoteListWrapper,
  VoteListArea,
  SubmitBtn,
  AlreadyVotedBox,
  VotedStateArea,
  VotedEmoji,
  VotedName,
  VotedHeadline,
  VotedSub,
  ResultRevealCard,
  ResultRole,
  ResultName,
  VoteActionRow,
  VoteResultBtn,
};

const NEW_MEMBER_COLOR = '#3b82f6';

export const PreviewInfoArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 160px;
`;

export const VoteTriggerBtn = styled.button`
  width: 100%;
  padding: 13px;
  border-radius: 10px;
  border: 1.5px solid #93c5fd;
  background: #eff6ff;
  color: ${NEW_MEMBER_COLOR};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 4px;
  touch-action: manipulation;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #dbeafe;
      border-color: #60a5fa;
    }
  }
  &:active {
    background: #dbeafe;
    border-color: #60a5fa;
  }
`;

export const CheerTriggerBtn = styled.button`
  flex: 1;
  padding: 11px;
  border-radius: 10px;
  border: 1.5px solid #fcd34d;
  background: #fffbeb;
  color: ${CHEER_COLOR};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #fef3c7;
      border-color: #fbbf24;
    }
  }
  &:active {
    background: #fef3c7;
    border-color: #fbbf24;
  }
`;

export const TargetScoreRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f8faff;
  border: 1px solid #e0e7ff;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #eff6ff;
      border-color: #bfdbfe;
    }
  }
  &:active {
    background: #eff6ff;
    border-color: #93c5fd;
  }
`;

const RANK_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: '#fef3c7', color: '#b45309' },
  2: { bg: '#f1f5f9', color: '#64748b' },
  3: { bg: '#ffedd5', color: '#c2410c' },
};

export const TargetScoreRank = styled.div<{ rank: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${({ rank }) => RANK_COLORS[rank]?.bg ?? '#dbeafe'};
  color: ${({ rank }) => RANK_COLORS[rank]?.color ?? '#2563eb'};
  font-size: 13px;
  font-weight: 800;
`;

export const TargetScoreName = styled.div`
  flex: 0 1 auto;
  min-width: 0;
  max-width: 140px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TargetScoreValue = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #2563eb;
  font-variant-numeric: tabular-nums;
`;
