import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const Wrapper = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 20001;
`;

export const Dim = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
`;

export const Sheet = styled(motion.div)`
  position: absolute;
  bottom: 0;
  width: 100%;
  max-height: 78%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom, 0px);
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  font-size: 14px;
  line-height: 1.3;
  font-weight: 700;
  color: #111827;
  border-bottom: 1px solid #f3f4f6;
`;

export const CloseBtn = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  touch-action: manipulation;
  padding: 11px;
  margin: -11px;
  color: #333;
`;

export const Body = styled.div`
  flex: 1;
  min-height: 0;
  padding: 12px 18px 0;
  overflow-y: auto;
  touch-action: pan-y;
  overscroll-behavior: contain;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Hint = styled.p`
  font-size: 12.5px;
  line-height: 1.4;
  color: #9ca3af;
  margin: 0 0 10px;
`;

export const CandidateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Footer = styled.div`
  display: flex;
  gap: 8px;
  padding: 14px 18px;
`;

export const ClearBtn = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
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
`;

export const ConfirmBtn = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #3b82f6;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  transition: background 0.15s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      background: #2563eb;
    }
  }
  &:active:not(:disabled) {
    background: #2563eb;
  }
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;
