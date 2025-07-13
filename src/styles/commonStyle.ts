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
  padding: ${({ padding }) => (padding === 'compact' ? '20px 32px' : '32px')};
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px
    rgba(0, 0, 0, ${({ boxShadowOpacity }) => boxShadowOpacity ?? 0.08});
  text-align: center;
`;

export const Title = styled.h1<{ size?: 'small' | 'medium' }>`
  font-size: ${({ size }) => (size === 'small' ? '22px' : '26px')};
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

export const SmallText = styled(motion.p)<{
  top?: 'far' | 'middle' | 'narrow';
}>`
  margin-top: ${({ top }) =>
    top === 'far' ? '20px' : top === 'middle' ? '15px' : '10px'};
  font-size: 12px;
  color: #666;
  text-align: center;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #333;
  }
`;
