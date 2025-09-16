import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const colors = {
  primary: '#3b82f6',
  accent: '#f97316',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    500: '#6b7280',
    700: '#374151',
  },
  success: '#22c55e',
  danger: '#ef4444',
};

export const Section = styled.div`
  margin-bottom: 20px;
`;

export const PinCount = styled.div`
  font-size: 15px;
  text-align: center;
  margin-bottom: 12px;
  color: ${colors.gray[700]};
`;

export const PinNumber = styled.span`
  font-weight: bold;
  color: ${colors.accent};
  font-size: 16px;
  margin-left: 4px;
`;

export const UserName = styled.span`
  font-weight: bold;
  color: ${colors.primary};
`;

export const ItemLabel = styled.label<{
  disabled?: boolean;
  selected?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid
    ${({ selected }) => (selected ? colors.primary : colors.gray[200])};
  border-radius: 10px;
  background-color: ${({ disabled, selected }) =>
    disabled ? colors.gray[50] : selected ? '#eff6ff' : '#fff'};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  margin-bottom: 10px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ disabled }) =>
      disabled ? colors.gray[200] : colors.primary};
    background-color: ${({ disabled }) =>
      disabled ? colors.gray[50] : '#f0f9ff'};
  }
`;

export const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

export const ItemInput = styled.input`
  accent-color: ${colors.primary};
`;

export const ItemName = styled.span`
  font-size: 14px;
  color: ${colors.gray[700]};
  font-weight: 500;
`;

export const Badge = styled.span`
  background-color: ${colors.primary}22;
  color: ${colors.primary};
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  margin-left: auto;
  text-align: center;
`;

export const HistoryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: ${colors.gray[300]} transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${colors.gray[300]};
    border-radius: 4px;
  }
`;

export const HistoryBox = styled.div`
  padding: 14px 16px;
  border-radius: 12px;
  background: ${colors.gray[50]};
  border: 1px solid ${colors.gray[200]};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
`;

export const HistoryTitle = styled.h3`
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 12px;
  color: ${colors.gray[700]};
`;

export const HistoryItem = styled(motion.li)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  font-size: 13px;
  border-bottom: 1px solid ${colors.gray[200]};

  &:last-child {
    border-bottom: none;
  }
`;

export const ItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const RemoveBadge = styled.button`
  background-color: #fee2e2;
  color: ${colors.danger};
  border: none;
  border-radius: 999px;
  font-size: 12px;
  padding: 2px 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #fecaca;
  }
`;
