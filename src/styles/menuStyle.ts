import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 7px;
`;

export const MenuHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const MenuTitleText = styled.h1`
  font-size: 26px;
  font-weight: bold;
  margin: 0;
`;

export const BellSpacer = styled.div`
  width: 32px;
  flex-shrink: 0;
`;

export const BellBtn = styled.button`
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  touch-action: manipulation;
  transition:
    background 0.15s ease,
    transform 0.1s ease;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: #f3f4f6;
    }
  }
  &:active {
    background: #e5e7eb;
    transform: scale(0.9);
  }
`;

export const BellCountBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9999px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
`;

type MenuCardProps = { disabled?: boolean };

export const MotionMenuCard = styled(motion.button)<MenuCardProps>`
  position: relative;
  background-color: ${({ disabled }) => (disabled ? '#e2e6ea' : '#f8f9fa')};
  border: 1.5px solid ${({ disabled }) => (disabled ? '#b0b8bf' : '#f0f2f5')};
  border-radius: 12px;
  padding: 0.9rem;
  color: ${({ disabled }) => (disabled ? '#a0a6ac' : '#333')};
  font-weight: 500;
  text-align: center;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  touch-action: manipulation;
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  box-shadow: ${({ disabled }) =>
    disabled ? 'none' : '0 2px 6px rgba(0, 0, 0, 0.03)'};
  transition: background-color 0.15s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 96px;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: ${({ disabled }) => (disabled ? '#e2e6ea' : '#eef6ff')};
    }
  }
`;

export const IconWrapper = styled.div`
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #e0efff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;

  svg {
    color: #0070f3;
  }
`;

export const MenuLabel = styled.span`
  margin-top: 4px;
  font-size: 13px;
  color: #333;
  line-height: 1.3;
  word-break: keep-all;
`;

type BadgeVariant = 'new' | 'hot' | 'soon';

const badgeColors: Record<BadgeVariant, { bg: string; color: string }> = {
  new: { bg: '#f97316', color: '#fff' },
  hot: { bg: '#ef4444', color: '#fff' },
  soon: { bg: '#2563eb', color: '#fff' },
};

type MenuBadgeProps = {
  variant?: BadgeVariant;
};

export const MenuBadge = styled(motion.span)<MenuBadgeProps>`
  position: absolute;
  top: -6px;
  right: ${({ variant = 'new' }) => (variant === 'soon' ? '-26px' : '-22px')};
  padding: 3px 7px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  color: ${({ variant = 'new' }) => badgeColors[variant].color};
  background-color: ${({ variant = 'new' }) => badgeColors[variant].bg};
  border-radius: 9999px;
  user-select: none;
  pointer-events: none;
  white-space: nowrap;
`;
