import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { SYS_FONT } from '../global/commonStyle';
import {
  Backdrop,
  Header,
  Title,
  Sub,
  Divider,
  ScrollArea,
  Empty,
  CloseBtn as SharedCloseBtn,
} from './VoteResultModalStyle';

export { Backdrop, Header, Title, Sub, Divider, ScrollArea, Empty };

export const CloseBtn = styled(SharedCloseBtn)`
  margin-top: 14px;
  margin-bottom: 18px;
`;

export const Card = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  max-height: 80dvh;
  font-family: ${SYS_FONT};
  -webkit-font-smoothing: antialiased;
`;

export const TabRow = styled.div`
  display: flex;
  gap: 6px;
  padding: 12px 20px;
`;

const TAB_TONE = {
  mine: { border: '#93c5fd', background: '#eff6ff', color: '#2563eb' },
  bonus: { border: '#fcd34d', background: '#fffbeb', color: '#d97706' },
} as const;

const tabTone = (tone: 'mine' | 'bonus' = 'mine') => TAB_TONE[tone];

export const TabBtn = styled.button<{ active: boolean; tone?: 'mine' | 'bonus' }>`
  flex: 1;
  padding: 9px;
  border-radius: 8px;
  border: 1.5px solid ${({ active, tone }) => (active ? tabTone(tone).border : '#e5e7eb')};
  background: ${({ active, tone }) => (active ? tabTone(tone).background : '#fff')};
  color: ${({ active, tone }) => (active ? tabTone(tone).color : '#6b7280')};
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      border-color: ${({ active, tone }) => (active ? undefined : tabTone(tone).border)};
    }
  }
  &:active {
    border-color: ${({ active, tone }) => (active ? undefined : tabTone(tone).border)};
  }
`;

export const PickResultRow = styled.div<{ correct?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  background: ${({ correct }) => (correct ? '#f0fdf4' : '#f9fafb')};
  border: 1px solid ${({ correct }) => (correct ? '#c6ecd8' : '#e5e7eb')};
`;

export const PickResultLabel = styled.span`
  font-size: 12.5px;
  color: #6b7280;
`;

export const PickResultValue = styled.span<{ correct?: boolean }>`
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ correct }) => (correct ? '#059669' : '#9ca3af')};
`;
