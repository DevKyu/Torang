import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const colors = {
  bg: {
    front: '#fafaf9',
    back: '#fffdf5',
    winner: '#fff8e1',
  },
  border: {
    default: '#e5e7eb',
    winner: '#facc15',
  },
  text: {
    primary: '#333',
    subtle: '#555',
    hint: '#6b7280',
    count: '#9ca3af',
  },
  badge: {
    defaultBg: '#f3f4f6',
    defaultText: '#444',
    selfBg: '#2563eb',
    selfText: '#fff',
  },
};

const font = {
  xs: '11px',
  sm: '12px',
  md: '14px',
  lg: '15px',
};

export const ScrollableCardGridWrapper = styled.div<{ scrollable: boolean }>`
  max-height: 55vh;
  overflow-y: auto;
  padding: 8px 12px 12px;
  position: relative;

  overscroll-behavior: contain;
  touch-action: pan-y;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  &:after {
    content: '';
    position: sticky;
    bottom: 0;
    height: ${({ scrollable }) => (scrollable ? '24px' : '0')};
    pointer-events: none;
    background: linear-gradient(to bottom, transparent, #fefefe);
  }
`;

export const DrawGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  justify-content: center;
  gap: 12px;
`;

export const CardContainer = styled.div`
  perspective: 1000px;
`;

export const CardInner = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 160px;
  transform-style: preserve-3d;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:active {
    scale: 1 !important;
  }
`;

export const CardFace = styled.div`
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 10px;
`;

export const Front = styled(CardFace)`
  background: ${colors.bg.front};
  border: 1px solid ${colors.border.default};
`;

export const Back = styled(CardFace)<{ isWinner?: boolean }>`
  transform: rotateY(180deg);
  background: ${({ isWinner }) =>
    isWinner ? colors.bg.winner : colors.bg.back};
  border: 1px solid
    ${({ isWinner }) =>
      isWinner ? colors.border.winner : colors.border.default};
  gap: 8px;

  ${({ isWinner }) =>
    isWinner && `box-shadow: 0 0 6px rgba(250, 204, 21, 0.4);`}
`;

export const Name = styled.h4`
  font-size: ${font.md};
  font-weight: 600;
  margin: 0;
  text-align: center;
  color: ${colors.text.primary};
`;

export const HintText = styled(motion.span)`
  font-size: ${font.sm};
  color: ${colors.text.hint};
`;

export const CardBadge = styled.span`
  font-size: ${font.sm};
  font-weight: bold;
  padding: 4px 10px;
  background-color: ${colors.badge.defaultBg};
  border-radius: 999px;
  color: ${colors.badge.defaultText};
`;

export const WinnerNames = styled.div<{ count: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: ${({ count }) => (count <= 2 ? '6px' : '4px')};
  text-align: center;
  margin: 4px 0;
`;

export const WinnerNameItem = styled(motion.span)<{
  count: number;
  isSupplement?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ count }) => (count <= 3 ? '14px' : '13px')};
  font-weight: 600;
  color: ${({ isSupplement }) => (isSupplement ? '#3b82f6' : '#f59e0b')};

  &.empty {
    color: #9ca3af;
    font-weight: 400;
  }
`;

export const SupporterCount = styled.p`
  font-size: ${font.xs};
  color: ${colors.text.count};
  margin: 0;
`;

export const SupporterList = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
`;

export const SupporterBadge = styled.span<{ isSelf?: boolean }>`
  font-size: ${font.xs};
  padding: 3px 6px;
  border-radius: 10px;
  background-color: ${({ isSelf }) =>
    isSelf ? colors.badge.selfBg : colors.badge.defaultBg};
  color: ${({ isSelf }) =>
    isSelf ? colors.badge.selfText : colors.badge.defaultText};
  font-weight: ${({ isSelf }) => (isSelf ? 'bold' : 'normal')};
`;

export const MoreText = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: ${font.xs};
  color: ${colors.text.subtle};
  background-color: ${colors.badge.defaultBg};
  padding: 4px 8px;
  border-radius: 999px;
  border: none;

  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:active {
    transform: scale(0.97);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #e5e7eb;
    }
  }
`;

export const HeaderWrapper = styled.div`
  min-height: 40px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const StickyHeader = styled(motion.div)`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: ${font.md};
  color: #444;
  background: #fff;
  border-bottom: 1px solid #eee;
`;

export const CompletionMessage = styled(motion.div)`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${font.lg};
  color: #16a34a;
  font-weight: bold;
`;

export const FooterWrapper = styled.div`
  margin-top: 16px;
  position: sticky;
  bottom: env(safe-area-inset-bottom, 0px);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
