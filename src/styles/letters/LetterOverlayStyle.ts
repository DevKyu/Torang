import { motion } from 'framer-motion';
import styled from '@emotion/styled';

export const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
`;

export const Modal = styled(motion.div)`
  background: #fffaf2;
  border: 1px solid #e0d6c8;
  border-radius: 16px;
  width: 340px;
  padding: 24px 20px;
  text-align: center;
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.4) inset;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
`;

export const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #32271c;
`;

export const TextArea = styled.textarea`
  width: 100%;
  height: 96px;
  border: 1px solid #e2d9cd;
  border-radius: 10px;
  padding: 12px;
  background: #fffdf8;
  resize: none;
  font-size: 16px;
  color: #3a2d22;
  outline: none;
  line-height: 1.4;
  overflow-y: auto;
  touch-action: pan-y;
  white-space: pre-wrap;

  &:focus {
    border-color: #d4b996;
    box-shadow: 0 0 0 2px rgba(212, 185, 150, 0.25);
    background: #fffaf2;
  }

  &::placeholder {
    color: #b6a896;
  }
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
`;

export const CharCount = styled.span`
  font-size: 0.75rem;
  color: #8b7d6b;
`;

export const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #5a4c3e;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;

  input {
    accent-color: #d4b996;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  span {
    cursor: pointer;
  }
`;

export const ErrorText = styled.p`
  margin-top: 6px;
  font-size: 0.8rem;
  color: #c2554f;
`;

export const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
`;

const BaseButton = styled.button`
  flex: 1;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  padding: 8px 0;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.1s ease;
  font-weight: 500;

  &:active {
    transform: scale(0.97);
  }
`;

export const PrimaryButton = styled(BaseButton)`
  background: #d4b996;
  color: white;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #c9a77c;
    }
  }
`;

export const SubtleButton = styled(BaseButton)`
  background: #f3efe8;
  color: #4b3f35;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #ece5dc;
    }
  }
`;
