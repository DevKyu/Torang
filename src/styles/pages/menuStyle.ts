import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { motion } from 'framer-motion';
import { DEFAULT_BADGE_COLOR } from '../../stores/eventStore';

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

export const BellCountBadge = styled(motion.span)`
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
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease,
    box-shadow 0.25s ease;
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
  transition: opacity 0.25s ease;

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
  transition: opacity 0.25s ease;
`;

const getReadableTextColor = (hex: string): string => {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#fff';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1f2937' : '#fff';
};

export const BadgeSlot = styled.div`
  position: absolute;
  top: -9px;
  left: 50%;
  display: flex;
  justify-content: flex-start;
  pointer-events: none;
`;

type MenuBadgeProps = {
  bg?: string;
};

export const MenuBadge = styled(motion.span)<MenuBadgeProps>`
  display: inline-block;
  max-width: 100px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.3;
  border-radius: 9999px;
  user-select: none;
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ bg = DEFAULT_BADGE_COLOR }) => css`
    background-color: ${bg};
    color: ${getReadableTextColor(bg)};
  `}
`;
