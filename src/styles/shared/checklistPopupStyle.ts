import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { SYS_FONT } from '../global/commonStyle';
import { Backdrop, Divider, ConfirmBtn } from '../mission/HiddenMissionModalStyle';

export { Backdrop, Divider, ConfirmBtn };

const HIDDEN_SCROLLBAR = `
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Card = styled(motion.div)<{ accent: string }>`
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 340px;
  max-height: calc(100vh - 48px);
  max-height: calc(100dvh - 48px);
  overflow-x: hidden;
  overflow-y: auto;
  touch-action: pan-y;
  border-top: 4px solid ${({ accent }) => accent};
  padding: 0 0 24px;
  font-family: ${SYS_FONT};
  -webkit-font-smoothing: antialiased;
  ${HIDDEN_SCROLLBAR}
`;

export const Title = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 20px 24px 4px;
  line-height: 1.3;
`;

export const Subtitle = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin: 0 24px 16px;
`;

export const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 24px 20px;
  max-height: min(270px, 40vh);
  max-height: min(270px, 40dvh);
  overflow-y: auto;
  touch-action: pan-y;
  ${HIDDEN_SCROLLBAR}
`;

export const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 12px;
`;

export const ItemIcon = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 17px;
`;

export const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ItemHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const ItemLabel = styled.div`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
`;

export const ItemDesc = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
`;

const statusPill = `
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 66px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
`;

export const DoneTag = styled.div`
  ${statusPill}
  background: #f0fdf4;
  color: #16a34a;
`;

export const GoBtn = styled.button`
  ${statusPill}
  background: #f97316;
  color: #fff;
  border: none;
  font-family: ${SYS_FONT};
  cursor: pointer;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  transition: filter 0.12s ease;
  &:active {
    filter: brightness(0.9);
  }
`;
