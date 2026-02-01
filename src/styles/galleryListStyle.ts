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

export const GalleryOuter = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: ${colors.bgSoft};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  overflow: hidden;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
`;

export const GalleryBox = styled(motion.div)`
  width: 100%;
  max-width: 420px;
  max-height: 660px;
  background: ${colors.bgCard};
  border-radius: 16px;
  box-shadow: ${colors.shadow};
  padding: 20px 18px 18px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
`;

export const GalleryTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.textMain};
  margin-bottom: 16px;
  text-align: center;
`;

export const ScrollableList = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  will-change: scroll-position;
`;

export const ListGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(121px, 1fr));
  gap: 12px;
  will-change: transform;
  transform: translateZ(0);
`;

export const ListCard = styled.div`
  background: ${colors.bgCard};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
`;

export const ListImageWrapper = styled.div`
  height: 110px;
  background: ${colors.bgSoft};
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  will-change: transform;
  transform: translateZ(0);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
    display: block;
    will-change: opacity;
    backface-visibility: hidden;
    transform: translateZ(0);
  }
`;

export const CaptionPreview = styled.div`
  padding: 6px 8px;
  font-size: 12px;
  color: ${colors.textSub};
`;

export const FooterRow = styled.div`
  padding: 6px 8px 8px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: ${colors.textSub};
`;

export const AddButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: ${colors.primary};
  color: white;
  font-size: 14px;
  cursor: pointer;
  will-change: background-color, transform;
  backface-visibility: hidden;

  &:active {
    transform: scale(0.96);
  }

  &:hover {
    background: ${colors.primaryHover};
  }
`;
