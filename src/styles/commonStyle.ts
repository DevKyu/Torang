import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const Container = styled.div<{ backgroundColor?: string }>`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ backgroundColor }) => backgroundColor || '#f9f9f9'};
`;

export const ContentBox = styled.div<{
  maxWidth?: string;
  padding?: string;
  boxShadowOpacity?: number;
}>`
  width: 90%;
  max-width: ${({ maxWidth }) => maxWidth || '400px'};
  padding: ${({ padding }) => (padding ? padding : '32px')};
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px
    rgba(0, 0, 0, ${({ boxShadowOpacity }) => boxShadowOpacity ?? 0.08});
  box-sizing: border-box;
  text-align: center;
`;

export const Title = styled.h1<{ size?: 'small' | 'medium' }>`
  font-size: ${({ size }) => (size === 'small' ? '22px' : '28px')};
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
`;

export const Button = styled.button`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  background-color: #0070f3;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: #005fcc;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #0070f3;
  }
`;

export const ErrorText = styled.p`
  color: #e00;
  font-size: 13px;
  margin-top: -8px;
`;

export const Section = styled.div`
  margin-bottom: 20px;
`;

export const ItemLabel = styled.label<{ disabled?: boolean }>`
  display: block;
  padding: 10px 14px;
  border: 1px solid ${({ disabled }) => (disabled ? '#ddd' : '#ccc')};
  border-radius: 8px;
  background-color: ${({ disabled }) => (disabled ? '#f5f5f5' : '#fff')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  margin-bottom: 12px;
  transition: border 0.2s ease;

  &:hover {
    border-color: ${({ disabled }) => (disabled ? '#ddd' : '#0070f3')};
  }
`;

export const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ItemInput = styled.input`
  accent-color: #0070f3;
`;

export const ItemContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const Badge = styled.span`
  background-color: #eee;
  color: #333;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 13px;
`;

export const PinCount = styled.p`
  font-size: 16px;
  color: #555;
  text-align: center;
`;

export const PinNumber = styled.span`
  font-weight: bold;
  color: #f97316;
`;

export const UserName = styled.span`
  font-weight: bold;
  color: #3b82f6;
`;

export const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  max-height: 180px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
`;

export const HistoryBox = styled.div`
  padding: 10px 16px 10px;
  border-radius: 12px;
  background-color: #f0f7ff;
  border: 1px solid #b3d4fc;
  box-shadow: 0 2px 8px rgba(0, 112, 243, 0.05);
`;

export const HistoryTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
`;

export const HistoryItem = styled(motion.li)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;
  border-bottom: 1px dashed #cce4ff;

  &:last-child {
    border-bottom: none;
  }
`;

export const ItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const RemoveBadge = styled.button`
  background-color: #fee2e2;
  color: #b91c1c;
  border: none;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #fecaca;
  }
`;

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
  transition: transform 0.2s ease;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    transform: scale(1.03);
  }
`;

export const HintText = styled(motion.span)`
  margin-top: 6px;
  font-size: 12px;
  color: #999;
`;

export const Name = styled.h4`
  font-size: 16px;
  margin: 0 0 8px;
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

export const CardGridWrapper = styled.div`
  margin: 24px 16px 16px;
`;

export const FooterWrapper = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

export const ScrollableCardGridWrapper = styled.div`
  max-height: 50vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  background: #fefefe;
  border-radius: 12px;
  border: 2px solid #f3f4f6;
  box-shadow: inset 0 4px 6px -4px rgba(0, 0, 0, 0.05);

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
    pointer-events: none;
    z-index: 1;
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

export const SmallText = styled(motion.p)`
  margin-top: 10px;
  font-size: 12px;
  color: #666;
  text-align: center;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #333;
  }
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
