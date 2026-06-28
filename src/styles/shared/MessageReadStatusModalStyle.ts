import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { SYS_FONT } from '../global/commonStyle';
import { Backdrop } from '../mission/HiddenMissionModalStyle';

export { Backdrop };

const EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif';

const THIN_SCROLLBAR = `
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
`;

export const Card = styled(motion.div)`
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 360px;
  max-height: calc(100vh - 48px);
  max-height: calc(100dvh - 48px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: ${SYS_FONT};
  -webkit-font-smoothing: antialiased;
`;

export const Header = styled.div`
  flex-shrink: 0;
  padding: 20px 20px 12px;
`;

export const ModalTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Summary = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

export const ReactionSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-family: ${EMOJI_FONT};
  font-size: 12px;
  color: #6b7280;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 0;
`;

export const List = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  touch-action: pan-y;
  padding: 4px 20px;
  ${THIN_SCROLLBAR}
`;

export const ListContent = styled(motion.div)`
  min-height: 100px;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid #f9fafb;
  &:last-child {
    border-bottom: none;
  }
`;

export const Name = styled.span`
  font-size: 14px;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
`;

export const ReactionEmoji = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  font-family: ${EMOJI_FONT};
  font-size: 14px;
`;

export const ReadTag = styled.span<{ read: boolean }>`
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: ${({ read }) => (read ? '#ecfdf5' : '#f9fafb')};
  color: ${({ read }) => (read ? '#059669' : '#9ca3af')};
`;

export const EmptyMsg = styled.p`
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
  padding: 24px 0;
  margin: 0;
`;

export const LoadingRow = styled.div`
  display: flex;
  justify-content: center;
  padding: 24px 0;
`;

export const Footer = styled.div`
  flex-shrink: 0;
  padding: 12px 20px calc(env(safe-area-inset-bottom, 0px) + 16px);
  border-top: 1px solid #f3f4f6;
`;

export const CloseBtn = styled.button`
  display: block;
  width: 100%;
  padding: 11px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  &:active {
    background: #e5e7eb;
  }
`;
