import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const SYS_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 16000;
  background: rgba(0, 0, 0, 0.55);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
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
`;

export const TypeTag = styled.div<{ color: string }>`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: ${({ color }) => color};
  margin: 20px 24px 6px;
`;

export const MessageTitle = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 0 24px 16px;
  line-height: 1.3;
  word-break: break-word;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 0 0 16px;
`;

export const ContentArea = styled.div<{ color: string }>`
  margin: 0 24px 20px;
  background: ${({ color }) => `${color}14`};
  border-radius: 10px;
  padding: 14px 16px;
  max-height: 45vh;
  max-height: 45dvh;
  overflow-y: auto;
  touch-action: pan-y;
`;

export const QueueIndicator = styled.div`
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin: 0 24px 10px;
`;

export const ConfirmBtn = styled.button<{ color: string }>`
  display: block;
  width: calc(100% - 48px);
  margin: 0 24px;
  padding: 12px;
  background: ${({ color }) => color};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  transition: filter 0.12s ease;
  &:active {
    filter: brightness(0.88);
  }
`;
