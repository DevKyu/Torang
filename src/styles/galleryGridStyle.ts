import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const colors = {
  bgSoft: '#f9fafb',
  bgCard: '#ffffff',
  border: '#e5e7eb',
  textMain: '#2d3748',
  textSub: '#6b7280',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  shadow: '0 2px 6px rgba(0,0,0,0.06)',
};

export const GridWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

export const GridItem = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: ${colors.bgSoft};
`;

export const Thumb = styled.img<{ visible?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${(p) => (p.visible ? 1 : 0)};
  transition: opacity 0.3s ease;

  border-radius: inherit;
  transform: translateZ(0);
`;

export const Skeleton = styled.div<{ hidden: boolean }>`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: ${(p) => (p.hidden ? 0 : 1)};
  transition: opacity 0.45s ease;

  background: linear-gradient(90deg, #f4f5f6 0%, #e9eaec 50%, #f4f5f6 100%);
  background-size: 300% 100%;
  animation: shimmer 2.4s linear infinite;

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

export const InfoBar = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
  pointer-events: none;
`;

export const InfoItem = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 4px;
  gap: 2px;
  height: 14px;

  font-size: 10px;
  line-height: 1.1;
  font-weight: 500;

  background: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(4px);
  color: #fff;

  border-radius: 4px;
  pointer-events: none;

  svg {
    width: 9px;
    height: 9px;
    display: block;
  }
`;
