import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/react';
import { motion } from 'framer-motion';

const colors = {
  bg: {
    default: '#f9fafb',
    achieved: '#f0f9ff',
  },
  border: {
    default: '#e5e7eb',
    achieved: '#bfdbfe',
    category: '#facc15',
  },
  tab: {
    activeBg: '#fff8e1',
    activeBorder: '#facc15',
    activeText: '#8a4b0b',
    inactiveBg: '#f3f4f6',
    inactiveText: '#555',
    hoverBg: '#e5e7eb',
    hoverActiveBg: '#ffefc1',
    pressActiveBg: '#ffe58a',
    pressInactiveBg: '#e0e0e0',
  },
  text: {
    desc: '#555',
    date: '#374151',
  },
  dateBg: '#e5e7eb',
};

const font = {
  xs: '11px',
  sm: '12px',
  md: '14px',
  lg: '15px',
};

const subtleGlow = keyframes`
  0%   { box-shadow: 0 0 3px rgba(147, 197, 253, 0.35); }
  50%  { box-shadow: 0 0 7px rgba(147, 197, 253, 0.5); }
  100% { box-shadow: 0 0 3px rgba(147, 197, 253, 0.35); }
`;

const strongGlow = keyframes`
  0%   { box-shadow: 0 0 4px rgba(96, 165, 250, 0.45); }
  50%  { box-shadow: 0 0 10px rgba(59, 130, 246, 0.65); }
  100% { box-shadow: 0 0 4px rgba(96, 165, 250, 0.45); }
`;

export const GridScrollContainer = styled.div`
  max-height: 350px;
  overflow-y: auto;
  padding: 0 12px 4px;

  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(121px, 1fr));
  gap: 12px;
`;

export const Card = styled(motion.div)<{ achieved: boolean }>`
  background: ${({ achieved }) =>
    achieved ? colors.bg.achieved : colors.bg.default};
  border: 1px solid
    ${({ achieved }) =>
      achieved ? colors.border.achieved : colors.border.default};
  border-radius: 10px;
  padding: 14px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  will-change: transform, box-shadow;
  opacity: ${({ achieved }) => (achieved ? 0.9 : 0.5)};
  filter: ${({ achieved }) => (achieved ? 'none' : 'grayscale(70%)')};
  transition: all 0.25s ease;

  ${({ achieved }) =>
    achieved &&
    css`
      animation: ${subtleGlow} 3s ease-in-out infinite;
    `}

  &:hover {
    transform: scale(1.01);

    ${({ achieved }) =>
      achieved &&
      css`
        opacity: 1;
        animation: ${strongGlow} 2s ease-in-out infinite;
      `}
  }
`;

export const CardIcon = styled.div`
  font-size: 24px;
  margin-bottom: 6px;
`;

export const CardTitle = styled.div`
  font-size: ${font.md};
  font-weight: 600;
  margin-bottom: 8px;
`;

export const CardDesc = styled.div`
  font-size: ${font.sm};
  color: ${colors.text.desc};
`;

export const AchievedDate = styled.div`
  font-size: ${font.xs};
  font-weight: 500;
  color: ${colors.text.date};
  background: ${colors.dateBg};
  padding: 2px 6px;
  border-radius: 6px;
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 3px;

  .check-icon {
    transition:
      stroke 0.25s ease,
      transform 0.25s ease;
  }

  &:hover .check-icon {
    stroke: #10b981;
    transform: scale(1.2);
  }
`;

export const CategoryBlock = styled.div`
  &:not(:first-of-type) {
    margin-top: 28px;
  }
`;

export const CategoryTitle = styled.h3`
  font-size: ${font.lg};
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  text-align: left;
  border-left: 4px solid ${colors.border.category};
  padding-left: 8px;
`;

export const TabBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 12px 0 16px;
`;

export const TabButton = styled.button<{ active?: boolean }>`
  font-size: 13px;
  font-weight: ${({ active }) => (active ? 700 : 500)};
  color: ${({ active }) =>
    active ? colors.tab.activeText : colors.tab.inactiveText};
  background: ${({ active }) =>
    active ? colors.tab.activeBg : colors.tab.inactiveBg};
  border: 1px solid
    ${({ active }) =>
      active ? colors.tab.activeBorder : colors.border.default};
  border-radius: 10px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active }) =>
      active ? colors.tab.hoverActiveBg : colors.tab.hoverBg};
  }

  &:active {
    background: ${({ active }) =>
      active ? colors.tab.pressActiveBg : colors.tab.pressInactiveBg};
    border-color: ${({ active }) =>
      active ? colors.tab.activeBorder : colors.border.default};
    transform: scale(0.96);
  }
`;
