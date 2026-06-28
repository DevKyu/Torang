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
  max-height: 52vh;
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

export const CardContainer = styled(motion.div)`
  -webkit-perspective: 1000px;
  perspective: 1000px;
  cursor: pointer;

  body.ios & {
    transition: scale 0.1s ease;

    &:active {
      scale: 0.97;
    }
  }
`;

export const CardInner = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 160px;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);

  &:active {
    scale: 1 !important;
  }
`;

export const CardFace = styled.div`
  position: absolute;
  inset: 0;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 10px;

  body.ios & {
    transition:
      opacity 0.4s ease,
      transform 0.4s ease-out;
  }
`;

export const Front = styled(CardFace)`
  background: ${colors.bg.front};
  border: 1px solid ${colors.border.default};
`;

export const Back = styled(CardFace)<{
  isWinner?: boolean;
  winnerCount: number;
}>`
  transform: rotateY(180deg);
  background: ${({ isWinner }) =>
    isWinner ? colors.bg.winner : colors.bg.back};
  border: 1px solid
    ${({ isWinner }) =>
      isWinner ? colors.border.winner : colors.border.default};
  gap: ${({ winnerCount }) => (winnerCount <= 2 ? '8px' : '4px')};

  ${({ isWinner }) =>
    isWinner && `box-shadow: 0 0 6px rgba(250, 204, 21, 0.4);`}
`;

export const Name = styled.h4`
  font-size: ${font.md};
  font-weight: 600;
  margin: 0;
  text-align: center;
  color: #1f2937;
`;

export const HintText = styled(motion.span)`
  font-size: ${font.sm};
  font-weight: 500;
  color: ${colors.text.hint};
`;

export const CardBadge = styled.span`
  font-size: ${font.sm};
  font-weight: 600;
  padding: 4px 6px;
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
  font-size: ${font.sm};
  font-weight: 500;
  color: ${colors.text.count};
  margin: 0;
`;

export const SupporterList = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
`;


export const MoreText = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: ${font.xs};
  color: ${colors.text.subtle};
  background-color: ${colors.badge.defaultBg};
  padding: 3px 6px;
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
  color: #374151;
  background: #fff;
  border-bottom: 1px solid #f3f4f6;
`;

export const CompletionMessage = styled(motion.div)`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${font.lg};
  color: #16a34a;
  font-weight: 700;
`;

export const DrawButton = styled.button`
  width: 100%;
  margin-top: 16px;
  padding: 13px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s, transform 0.1s;

  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
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

export const DrawLoadingBox = styled.div`
  display: flex;
  justify-content: center;
`;

export const PrepareSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
`;

export const PrepareIcon = styled.div`
  font-size: 40px;
  line-height: 1;
  margin-bottom: 12px;
`;

export const ContentArea = styled.div`
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const PrepareTitle = styled.p`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

export const PrepareDesc = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
  white-space: pre-line;
`;
