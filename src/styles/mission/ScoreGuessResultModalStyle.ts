import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { SYS_FONT } from '../global/commonStyle';
import { Backdrop, Header, Title, Sub, Divider, ScrollArea, Empty, CloseBtn } from './VoteResultModalStyle';

export { Backdrop, Header, Title, Sub, Divider, ScrollArea, Empty, CloseBtn };

export const Card = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 340px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 65vh;
  max-height: 65dvh;
  font-family: ${SYS_FONT};
  -webkit-font-smoothing: antialiased;
`;

export const GroupHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 10px 4px;
  border-bottom: 1px solid #eff6ff;
  margin-bottom: 2px;
`;

export const GroupHeaderName = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const GroupHeaderScore = styled.div`
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: #2563eb;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
`;

export const Row = styled.div<{ correct?: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 56px 20px;
  align-items: center;
  gap: 8px;
  padding: 10px 10px;
  border-radius: 8px;
  margin-bottom: 4px;
  background: ${({ correct }) => (correct ? '#f0fdf4' : '#f8faff')};
`;

export const NameWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  overflow: hidden;
`;

export const Name = styled.div`
  min-width: 0;
  font-size: 13px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MyTag = styled.span`
  flex-shrink: 0;
  font-size: 10px;
  color: #2563eb;
  font-weight: 700;
  border: 1px solid currentColor;
  border-radius: 3px;
  padding: 1px 4px;
  line-height: 1.4;
  white-space: nowrap;
`;

export const ScoreCell = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

export const CheckWrap = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;
