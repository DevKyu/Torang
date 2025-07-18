import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const DrawFlexGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;

  > div {
    flex: 1 1 120px;
    max-width: 140px;

    @media (min-width: 480px) {
      max-width: 160px;
    }
    @media (min-width: 768px) {
      max-width: 180px;
    }
    @media (min-width: 1024px) {
      max-width: 200px;
    }
  }
`;

export const CardContainer = styled.div`
  aspect-ratio: 4 / 5;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: scale(1.03);
  }
`;

export const CardInner = styled(motion.div)`
  position: relative;
  height: 100%;
  transform-style: preserve-3d;
  border-radius: 12px;
  perspective: 1000px;
`;

export const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding-top: 27px;
`;

export const Front = styled(CardFace)`
  background: #f9fafb;
`;

export const Back = styled(CardFace)<{ isWinner?: boolean }>`
  background: ${({ isWinner }) => (isWinner ? '#fff0f0' : '#fffbe6')};
  transform: rotateY(180deg);
  border: ${({ isWinner }) => (isWinner ? '2px solid #ef4444' : 'none')};
  box-shadow: ${({ isWinner }) =>
    isWinner
      ? '0 0 12px rgba(239, 68, 68, 0.5)'
      : '0 4px 12px rgba(0, 0, 0, 0.05)'};
`;

export const Name = styled.h4`
  font-size: 16px;
  margin: 0 0 8px;
`;

export const HintText = styled(motion.span)`
  margin-top: 6px;
  font-size: 12px;
  color: #999;
`;

export const CardBadge = styled.span`
  font-size: 13px;
  font-weight: bold;
  padding: 4px 10px;
  background-color: #eee;
  border-radius: 999px;
  color: #555;
  margin: 0 auto;
`;

export const WinnerName = styled(motion.p)`
  font-size: 16px;
  color: #f97316;
  font-weight: bold;
  margin-top: 8px;
`;

export const CardGridWrapper = styled.div`
  margin: 24px 16px 16px;
`;

export const ScrollableCardGridWrapper = styled.div`
  max-height: 50vh;
  overflow-y: auto;
  background: #fefefe;
  border: 2px solid #f3f4f6;
  border-radius: 12px;
  box-shadow: inset 0 4px 6px -4px rgba(0, 0, 0, 0.05);
  scroll-behavior: smooth;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  position: relative;
  &:after {
    content: '';
    position: sticky;
    bottom: 0;
    height: 24px;
    background: linear-gradient(to bottom, transparent, #fefefe);
  }
`;

export const StickyHeader = styled(motion.p)`
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: #444;
  border-bottom: 1px solid #eee;
  text-align: center;
`;

export const CompletionMessage = styled(motion.p)`
  text-align: center;
  font-size: 16px;
  color: #16a34a;
  font-weight: bold;
  margin: 12px;
`;

export const FooterWrapper = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SupporterCount = styled.p`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

export const SupporterList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
`;

export const SupporterBadge = styled.span<{ isSelf?: boolean }>`
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: ${({ isSelf }) => (isSelf ? '#dbeafe' : '#f3f4f6')};
  color: ${({ isSelf }) => (isSelf ? '#1e40af' : '#444')};
  font-weight: ${({ isSelf }) => (isSelf ? 'bold' : 'normal')};
`;

export const MoreText = styled.span`
  font-size: 12px;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 4px 8px;
  border-radius: 12px;
  margin-left: 4px;
  cursor: default;

  &:hover {
    background-color: #e5e7eb;
  }
`;
