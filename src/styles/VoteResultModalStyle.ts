import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { SYS_FONT } from './commonStyle';
import {
  Backdrop,
  Header,
  Title,
  Sub,
  Divider,
  ScrollArea,
} from './CorrectVotersModalStyle';

export { Backdrop, Header, Title, Sub, Divider, ScrollArea };

export const Card = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  max-height: 70dvh;
  font-family: ${SYS_FONT};
  -webkit-font-smoothing: antialiased;
`;

export const Row = styled.div<{ role?: 'villain' | 'helper' }>`
  display: grid;
  grid-template-columns: minmax(0, 80px) 1fr auto 20px;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 4px;
  background: ${({ role }) =>
    role === 'villain' ? '#fff5f5' : role === 'helper' ? '#eff6ff' : 'transparent'};
`;

export const Name = styled.div<{ role?: 'villain' | 'helper' }>`
  font-size: 13px;
  font-weight: ${({ role }) => (role ? '700' : '400')};
  color: ${({ role }) =>
    role === 'villain' ? '#dc2626' : role === 'helper' ? '#2563eb' : '#374151'};
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;
`;

export const RoleTag = styled.span<{ color: string }>`
  font-size: 10px;
  color: ${({ color }) => color};
  font-weight: 700;
  border: 1px solid currentColor;
  border-radius: 3px;
  padding: 1px 4px;
  line-height: 1.4;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const MyVoteIndicator = styled.div<{ visible: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  flex-shrink: 0;
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};

`;

export const BarWrap = styled.div`
  height: 7px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
`;

export const Bar = styled.div<{ pct: number; color: string }>`
  width: ${({ pct }) => pct}%;
  height: 100%;
  background: ${({ color }) => color};
  transition: width 0.5s ease;
`;

export const Count = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-align: right;
`;

export const Empty = styled.div`
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  padding: 20px 0;
`;

export const CloseBtn = styled.button`
  margin: 12px 20px;
  padding: 11px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  &:active {
    background: #e5e7eb;
  }
`;
