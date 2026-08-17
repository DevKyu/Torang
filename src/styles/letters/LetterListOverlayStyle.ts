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
  max-height: 70vh;
  overflow-y: auto;
  touch-action: pan-y;
`;

export const Title = styled.h3`
  font-size: 1.05rem;
  font-weight: 600;
  color: #32271c;
  margin-bottom: 12px;
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
`;

export const Item = styled.div`
  background: #fffdf8;
  border: 1px solid #e6dccd;
  border-radius: 10px;
  padding: 10px;
  text-align: left;
`;

export const Sender = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: #5a4331;
  margin-bottom: 4px;
`;

export const Message = styled.div`
  font-size: 0.9rem;
  color: #3a2d22;
  white-space: pre-line;
`;

export const CloseButton = styled.button`
  margin-top: 8px;
  width: 100%;
  background: #d4b996;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #c9a77c;
    }
  }
`;
