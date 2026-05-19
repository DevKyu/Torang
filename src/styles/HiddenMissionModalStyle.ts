import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 16000;
  background: rgba(0, 0, 0, 0.55);
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
  overflow: hidden;
  border-top: 4px solid ${({ accent }) => accent};
  padding: 0 0 24px;
`;

export const ProgressTrack = styled.div`
  height: 3px;
  background: #f3f4f6;
`;

export const ProgressFill = styled.div<{ color: string }>`
  height: 100%;
  background: ${({ color }) => color};
  transition: width 0.05s linear;
`;

export const RoleTag = styled.div<{ color: string }>`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: ${({ color }) => color};
  margin: 20px 24px 6px;
`;

export const MissionTitle = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 0 24px 16px;
  line-height: 1.3;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 0 0 16px;
`;

export const ContentArea = styled.div<{ color: string }>`
  margin: 0 24px 20px;
  background: ${({ color }) =>
    color === '#ef4444' ? '#fef2f2' : '#eff6ff'};
  border-radius: 10px;
  padding: 14px 16px;
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
  transition: filter 0.12s ease;
  &:active { filter: brightness(0.88); }
`;
