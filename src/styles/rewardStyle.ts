import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const colors = {
  primary: '#3b82f6',
  accent: '#f97316',
  gray: {
    50: '#f9fafb',
    200: '#e5e7eb',
    300: '#d1d5db',
    500: '#6b7280',
    700: '#374151',
  },
  danger: '#ef4444',
};

export const Section = styled.div`
  margin-bottom: 20px;
`;

export const SubmitButton = styled.button`
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 11px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, ${colors.primary}, #2563eb);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s, transform 0.1s;

  &:disabled {
    background: ${colors.gray[200]};
    color: ${colors.gray[500]};
    cursor: default;
  }

  &:not(:disabled) {
    &:active {
      transform: scale(0.985);
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        opacity: 0.9;
      }
    }
  }
`;

export const PinCount = styled.div`
  font-size: 15px;
  text-align: center;
  margin-bottom: 12px;
  color: ${colors.gray[700]};
`;

export const PinNumber = styled.span`
  font-weight: 700;
  color: ${colors.accent};
  margin-left: 4px;
`;

export const UserName = styled.span`
  font-weight: 700;
  color: ${colors.primary};
`;

export const LockNotice = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: fit-content;
  margin: 0 auto 12px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  color: ${colors.primary};
  background: #eff6ff;
  border-radius: 20px;
`;

export const ItemLabel = styled.label<{
  disabled?: boolean;
  selected?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid
    ${({ selected }) => (selected ? colors.primary : colors.gray[200])};
  border-radius: 10px;
  background-color: ${({ disabled, selected }) =>
    disabled ? colors.gray[50] : selected ? '#eff6ff' : '#fff'};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  margin-bottom: 10px;
  transition: border-color 0.15s, background-color 0.15s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: ${({ disabled }) =>
        disabled ? colors.gray[200] : colors.primary};
      background-color: ${({ disabled }) =>
        disabled ? colors.gray[50] : '#f0f9ff'};
    }
  }
`;

export const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

export const NameGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
`;

export const ItemInput = styled.input`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  accent-color: ${colors.primary};
  cursor: inherit;
`;

export const ItemName = styled.span`
  font-size: 14px;
  color: ${colors.gray[700]};
  font-weight: 500;
  white-space: nowrap;
`;

export const Badge = styled.span`
  background-color: ${colors.primary}22;
  color: ${colors.primary};
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  white-space: nowrap;
`;

export const RatioBadge = styled.span`
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 2px 7px;
  white-space: nowrap;
`;

export const InfoButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  background: #fff;
  color: #9ca3af;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  line-height: 1;

  &::after {
    content: '';
    position: absolute;
    top: -10px;
    right: -10px;
    bottom: -10px;
    left: 0;
  }

  &:active {
    background: #f3f4f6;
  }
`;

export const HistoryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
  touch-action: pan-y;
  overflow-x: hidden;

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
  font-weight: 700;
  margin-bottom: 12px;
  color: ${colors.gray[700]};
`;

export const HistoryItem = styled(motion.li)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
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
  line-height: 1;
  padding: 5px 10px;
  cursor: pointer;
  transition: background-color 0.15s;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #fecaca;
    }
  }

  &:active {
    background-color: #fecaca;
  }
`;
