import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { SYS_FONT } from '../global/commonStyle';
import { Backdrop } from './HiddenMissionModalStyle';

export { Backdrop };

export const Card = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 320px;
  padding: 24px 20px 20px;
  text-align: center;
  font-family: ${SYS_FONT};
  -webkit-font-smoothing: antialiased;
`;

export const Heading = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
`;

export const InputRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  margin-bottom: 20px;
`;

export const Input = styled.input`
  width: 96px;
  padding: 10px 0;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  color: #2563eb;
  background: #f8faff;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  box-sizing: border-box;
  font-variant-numeric: tabular-nums;
  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

export const InputUnit = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #93a5c9;
`;

export const MessageArea = styled.textarea`
  width: 100%;
  height: 64px;
  padding: 10px 12px;
  font-size: 13px;
  color: #374151;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-sizing: border-box;
  resize: none;
  line-height: 1.5;
  overflow-y: auto;
  touch-action: pan-y;
  white-space: pre-wrap;
  font-family: inherit;
  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  &::placeholder {
    color: #b0b8c4;
  }
`;

export const MessageInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  margin-bottom: 16px;
`;

export const CharCount = styled.span`
  font-size: 11px;
  color: #9ca3af;
`;

export const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  user-select: none;

  input {
    accent-color: #3b82f6;
    width: 14px;
    height: 14px;
    cursor: pointer;
  }
`;

export const SaveBtn = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #3b82f6;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  transition: background 0.15s ease;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #2563eb;
    }
  }
  &:active {
    background: #2563eb;
  }
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

export const CancelBtn = styled.button`
  width: 100%;
  margin-top: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #f3f4f6;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  transition: background 0.15s ease;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #e5e7eb;
    }
  }
  &:active {
    background: #e5e7eb;
  }
`;
