import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const ITEM_HEIGHT = 60;
const VISIBLE_COUNT = 5;

export const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20001;
`;

export const Dim = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
`;

export const Sheet = styled(motion.div)`
  position: absolute;
  bottom: 0;
  width: 100%;
  max-height: 70%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 16px 18px;
  font-size: 14px;
  font-weight: 500;
  color: #444;
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const List = styled.div`
  max-height: ${ITEM_HEIGHT * VISIBLE_COUNT + 1}px;
  overflow-y: auto;

  margin: 0;
  padding: 0;

  -webkit-overflow-scrolling: touch;

  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  touch-action: pan-y;
`;

export const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  height: ${ITEM_HEIGHT}px;
  padding: 0 18px;

  transition: opacity 0.12s ease;

  &:active {
    opacity: 0.6;
  }
`;

export const Avatar = styled.div<{ bg: string }>`
  width: 34px;
  height: 34px;
  border-radius: 50%;

  background: ${({ bg }) => bg};
  color: #fff;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 13px;
  font-weight: 500;

  flex-shrink: 0;
`;

export const Name = styled.div`
  font-size: 14px;
  color: #333;
`;
