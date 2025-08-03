import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const popoverStyle = {
  backgroundColor: '#f9fafb',
  padding: '6px 12px',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
  fontSize: '0.85rem',
  color: '#333',
  whiteSpace: 'nowrap' as const,
  border: '1px solid #e5e7eb',
  zIndex: 100,
  letterSpacing: '-0.01em',
  maxWidth: '220px',
  lineHeight: 1.5,
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

  &:hover {
    background-color: #f1f5f9;
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
