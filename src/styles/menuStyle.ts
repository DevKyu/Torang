import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 7px;
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
