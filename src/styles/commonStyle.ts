import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const Container = styled.div<{ backgroundColor?: string }>`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background-color: ${({ backgroundColor }) => backgroundColor || '#f9f9f9'};
`;

export const ContentBox = styled.div<{
  maxWidth?: string;
  paddingLarge?: string;
  boxShadowOpacity?: number;
}>`
  width: 90%;
  max-width: ${({ maxWidth }) => maxWidth || '400px'};
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px
    rgba(0, 0, 0, ${({ boxShadowOpacity }) => boxShadowOpacity ?? 0.08});
  box-sizing: border-box;
  text-align: center;

  @media (min-width: 768px) {
    padding: ${({ paddingLarge }) => paddingLarge || '48px'};
    border-radius: 20px;
  }
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
  padding: 0px 16px 16px;
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
