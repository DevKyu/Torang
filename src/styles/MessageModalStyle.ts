import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { SYS_FONT } from './commonStyle';
import {
  Backdrop,
  RoleTag as TypeTag,
  ConfirmBtn,
} from './HiddenMissionModalStyle';

export { Backdrop, TypeTag, ConfirmBtn };

const EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif';

const TAP_RESET = `
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-appearance: none;
  appearance: none;
`;

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
  ${THIN_SCROLLBAR}
`;

export const MessageTitle = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 0 24px 14px;
  line-height: 1.3;
  word-break: break-word;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 0 0 14px;
`;

export const ContentArea = styled.div<{ color: string }>`
  margin: 0 24px 10px;
  background: ${({ color }) => `${color}14`};
  border-radius: 10px;
  padding: 14px 16px;
  max-height: 45vh;
  max-height: 45dvh;
  overflow-y: auto;
  touch-action: pan-y;
  ${THIN_SCROLLBAR}
`;

export const ReactionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 24px 8px;
  padding: 6px 2px;
  touch-action: manipulation;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ReactionPill = styled.button<{ selected: boolean; color: string }>`
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid
    ${({ selected, color }) => (selected ? color : 'transparent')};
  background: ${({ selected, color }) =>
    selected ? `${color}14` : '#f3f4f6'};
  color: ${({ selected, color }) => (selected ? color : '#4b5563')};
  font-family: ${EMOJI_FONT};
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  touch-action: manipulation;
  ${TAP_RESET}
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.1s ease;
  &:active {
    transform: scale(0.9);
  }
`;

export const ReactionPillCount = styled(motion.span)`
  position: absolute;
  top: -4px;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 15px;
  height: 15px;
  padding: 0 3px;
  border-radius: 999px;
  background: #6b7280;
  border: 1.5px solid #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  color: #fff;
  font-family: ${SYS_FONT};
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
`;

export const QueueIndicator = styled.div`
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin: 0 24px 8px;
`;

