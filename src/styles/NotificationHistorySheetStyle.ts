import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export { TypeBadge } from './AdminMessagesStyle';

const gpu = `transform: translate3d(0,0,0); backface-visibility: hidden;`;

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
  background: rgba(0, 0, 0, 0.45);
  ${gpu}
`;

export const Sheet = styled(motion.div)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 60vh;
  max-height: 60dvh;
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
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  touch-action: pan-y;
  overscroll-behavior: contain;

  padding: 0 20px calc(env(safe-area-inset-bottom, 0px) + 16px);
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Header = styled.div`
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 20px 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
  touch-action: none;
  cursor: grab;
`;

export const Title = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #111;
`;

export const EmptyMsg = styled.p`
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
  padding: 32px 0;
  margin: 0;
`;

export const HistoryRow = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 0;
  cursor: pointer;
  touch-action: manipulation;
  transition: background 0.15s ease;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #f9fafb;
    }
  }
  &:active {
    background: #f3f4f6;
  }
  &:last-child {
    border-bottom: none;
  }
`;

export const HistoryRowTop = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const UnreadDot = styled.span`
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
`;

export const RowTitle = styled.span<{ read?: boolean }>`
  font-size: 14px;
  font-weight: ${({ read }) => (read ? 500 : 700)};
  color: ${({ read }) => (read ? '#6b7280' : '#111827')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RowMeta = styled.div`
  font-size: 12px;
  color: #9ca3af;
  margin-top: 7px;
`;
