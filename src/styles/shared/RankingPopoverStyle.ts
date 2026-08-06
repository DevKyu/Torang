import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { POPOVER_BASE_STYLE } from './popoverBaseStyle';

export const popoverStyle = {
  ...POPOVER_BASE_STYLE,
  padding: '6px 12px',
};

export const TriggerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font: inherit;
`;

export const ScoreRow = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  gap: 8px;
  border-radius: 10px;
  transition: background-color 0.2s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #f1f5f9;
    }
  }
`;

export const DateText = styled.span`
  font-size: 0.82rem;
  color: #6b7280;
`;

export const ScoreText = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
  width: 24px;
`;

export const EmptyText = styled.div`
  font-size: 0.82rem;
  color: #9ca3af;
`;
