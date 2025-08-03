import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const MenuGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
`;

type MenuCardProps = { disabled?: boolean };

export const MotionMenuCard = styled(motion.button)<MenuCardProps>`
  position: relative;
  background-color: ${({ disabled }) => (disabled ? '#e2e6ea' : '#f8f9fa')};
  border: 1.5px solid ${({ disabled }) => (disabled ? '#b0b8bf' : '#f0f2f5')};
  border-radius: 12px;
  padding: 1rem;
  font-size: 14px;
  color: ${({ disabled }) => (disabled ? '#a0a6ac' : '#333')};
  font-weight: 500;
  text-align: center;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  box-shadow: ${({ disabled }) =>
    disabled ? 'none' : '0 2px 6px rgba(0, 0, 0, 0.03)'};
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100px;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? '#e2e6ea' : '#eef6ff')};
  }

  &:active {
    transform: ${({ disabled }) => (disabled ? 'none' : 'scale(0.98)')};
  }
`;

export const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0efff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;

  svg {
    color: #0070f3;
  }
`;

export const MenuLabel = styled.span`
  margin-top: 4px;
  font-size: 13px;
  color: #333;
`;

type BadgeVariant = 'new' | 'hot' | 'soon';

const badgeColors: Record<BadgeVariant, { bg: string; color: string }> = {
  new: { bg: '#f97316', color: '#fff' }, // orange
  hot: { bg: '#ef4444', color: '#fff' }, // red
  soon: { bg: '#2563eb', color: '#fff' }, // blue
};

type MenuBadgeProps = {
  variant?: BadgeVariant;
};

export const MenuBadge = styled(motion.span)<MenuBadgeProps>`
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 7px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ variant = 'new' }) => badgeColors[variant].color};
  background-color: ${({ variant = 'new' }) => badgeColors[variant].bg};
  border-radius: 9999px;
  user-select: none;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
`;
