import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

export const SYS_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const Container = styled.div<{ backgroundColor?: string }>`
  min-height: 100vh;
  min-height: 100dvh;
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
  padding: ${({ padding }) =>
    padding === 'compact'
      ? '20px 32px'
      : padding === 'draw'
        ? '20px 24px'
        : padding === 'login'
          ? '32px'
          : '32px 32px 20px'};
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px
    rgba(0, 0, 0, ${({ boxShadowOpacity }) => boxShadowOpacity ?? 0.08});
  text-align: center;
`;

export const Title = styled.h1<{ size?: 'small' }>`
  font-size: ${({ size }) => (size === 'small' ? '22px' : '26px')};
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

export const Button = styled.button`
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background-color: #0070f3;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  touch-action: manipulation;
  transition: background 0.2s;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: #005fcc;
    }
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const StyledSmallText = styled(motion.p)<{
  top?: 'far' | 'middle' | 'narrow';
}>`
  margin-top: ${({ top }) =>
    top === 'far' ? '10px' : top === 'middle' ? '8px' : '4px'};
  padding: 10px 16px;
  font-size: 12px;
  color: #666;
  text-align: center;
  text-decoration: underline;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;

  &:active {
    opacity: 0.5;
    transform: scale(0.96);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: #333;
    }
  }
`;

export const SmallText = ({
  top,
  style,
  onClick,
  children,
}: {
  top?: 'far' | 'middle' | 'narrow';
  style?: CSSProperties;
  onClick?: () => void;
  children: ReactNode;
}) => (
  <StyledSmallText
    top={top}
    style={style}
    onPointerUp={(e) => {
      e.preventDefault();
      if (e.isPrimary) onClick?.();
    }}
    onContextMenu={(e) => e.preventDefault()}
  >
    {children}
  </StyledSmallText>
);
