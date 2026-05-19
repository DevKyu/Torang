import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const MissionCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
`;

export const CardTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 10px;
`;

export const HtmlBody = styled.div`
  font-size: 13px;
  color: #374151;
  line-height: 1.65;

  p {
    margin: 0 0 2px;
  }
  p:last-child {
    margin-bottom: 0;
  }
  p:empty {
    height: 0.75em;
  }
  p:has(> br:only-child) {
    height: 0.75em;
    line-height: 0;
    margin: 0;
  }
  strong {
    font-weight: 700;
  }
  em {
    font-style: italic;
  }
  u {
    text-decoration: underline;
    color: inherit;
  }
`;

export const PlainBody = styled.div`
  font-size: 13px;
  color: #374151;
  line-height: 1.65;
  white-space: pre-wrap;
`;

export const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 8px;
`;

export const HiddenMissionBtn = styled.button<{ role: 'villain' | 'helper' }>`
  width: 100%;
  padding: 13px;
  border-radius: 12px;
  border: 1.5px solid
    ${({ role }) => (role === 'villain' ? '#fca5a5' : '#93c5fd')};
  background: ${({ role }) => (role === 'villain' ? '#fef2f2' : '#eff6ff')};
  color: ${({ role }) => (role === 'villain' ? '#dc2626' : '#2563eb')};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 4px;
  touch-action: manipulation;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
  &:active {
    background: ${({ role }) => (role === 'villain' ? '#fee2e2' : '#dbeafe')};
    border-color: ${({ role }) => (role === 'villain' ? '#f87171' : '#60a5fa')};
  }
`;

export const UpcomingCard = styled.div`
  text-align: center;
  padding: 40px 16px;
`;

export const UpcomingDays = styled.div`
  font-size: 56px;
  font-weight: 800;
  color: #111827;
  line-height: 1;
  margin-bottom: 10px;
`;

export const UpcomingLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

export const VotingInstruction = styled.div`
  font-size: 13px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 16px;
  line-height: 1.5;
`;

export const VoteListWrapper = styled.div`
  position: relative;
  margin-bottom: 12px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 48px;
    background: linear-gradient(to bottom, transparent, #fff);
    pointer-events: none;
  }
`;

export const VoteListArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 40vh;
  overflow-y: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const VoterCard = styled(motion.div)<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  border-radius: 10px;
  border: 1.5px solid ${({ selected }) => (selected ? '#3b82f6' : '#e5e7eb')};
  background: ${({ selected }) => (selected ? '#eff6ff' : '#fff')};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
`;

export const VoteCheckmark = styled.span`
  font-size: 16px;
  color: #2563eb;
  flex-shrink: 0;
  transition: opacity 0.15s;
`;

export const SubmitBtn = styled.button`
  width: 100%;
  padding: 13px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
  transition: background 0.15s ease;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #2563eb;
    }
  }
  &:disabled {
    background: #cbd5e1;
    color: #fff;
    cursor: not-allowed;
  }
`;

export const AlreadyVotedBox = styled.div`
  text-align: center;
  padding: 32px 16px;
  background: #f9fafb;
  border-radius: 14px;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const VotedEmoji = styled.div`
  font-size: 44px;
  line-height: 1;
  margin-bottom: 4px;
`;

export const VotedName = styled.div`
  font-size: 16px;
  color: #374151;
`;

export const VotedSub = styled.div`
  font-size: 13px;
  color: #9ca3af;
  margin-top: 4px;
`;

export const ResultRevealCard = styled.div<{
  role: 'villain' | 'helper' | 'reward';
}>`
  background: ${({ role }) =>
    role === 'villain' ? '#fef2f2' : role === 'helper' ? '#eff6ff' : '#f0fdf4'};
  border: 1px solid
    ${({ role }) =>
      role === 'villain'
        ? '#fecaca'
        : role === 'helper'
          ? '#bfdbfe'
          : '#bbf7d0'};
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  text-align: center;
`;

export const ResultRole = styled.div<{ role: 'villain' | 'helper' | 'reward' }>`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: ${({ role }) =>
    role === 'villain' ? '#dc2626' : role === 'helper' ? '#2563eb' : '#059669'};
  margin-bottom: 4px;
`;

export const ResultName = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 4px;
`;

export const ResultMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

export const PinAmount = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #059669;
  margin-top: 2px;
`;

export const VoterListBtn = styled.button`
  display: block;
  margin: 6px auto 0;
  font-size: 12px;
  color: #059669;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  touch-action: manipulation;
  text-decoration: underline;
`;

export const VoteResultBtn = styled.button`
  width: 100%;
  padding: 11px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  touch-action: manipulation;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #e5e7eb;
    }
  }
  &:active {
    background: #e5e7eb;
  }
`;

export const MyVoteResult = styled.div<{ correct: boolean }>`
  text-align: center;
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  margin-top: 8px;
  background: ${({ correct }) => (correct ? '#f0fdf4' : '#fef2f2')};
  color: ${({ correct }) => (correct ? '#059669' : '#dc2626')};
`;

export const MissionLoadingBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
`;
