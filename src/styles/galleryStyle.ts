import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const colors = {
  bgSoft: '#f9fafb',
  bgCard: '#ffffff',
  border: '#e5e7eb',
  textMain: '#2d3748',
  textSub: '#6b7280',
  inputBg: '#f3f4f6',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  danger: '#ef4444',
  dangerHover: '#dc2626',
  dangerBorder: '#fecaca',
  shadow: '0 2px 6px rgba(0,0,0,0.06)',
};

export const GalleryOuter = styled.div`
  height: 100vh;
  background: ${colors.bgSoft};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

export const GalleryBox = styled(motion.div)`
  width: 100%;
  max-width: 420px;
  max-height: 620px;
  background: ${colors.bgCard};
  border-radius: 16px;
  box-shadow: ${colors.shadow};
  padding: 22px 18px 18px;
  display: flex;
  flex-direction: column;
  text-align: center;
  overflow: hidden;
`;

export const GalleryTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.textMain};
  margin-bottom: 18px;
`;

export const NoticeBox = styled.div`
  width: 100%;
  padding: 14px 10px;
  background: #fff6f6;
  border: 1px solid ${colors.dangerBorder};
  border-radius: 10px;
  color: ${colors.danger};
  font-size: 14px;
  margin-bottom: 14px;
`;

export const DropArea = styled.div<{ isActive: boolean; isDisabled: boolean }>`
  width: 100%;
  border: 2px dashed ${(p) => (p.isActive ? colors.primary : colors.border)};
  background: ${(p) => (p.isActive ? '#f0f6ff' : colors.bgSoft)};
  border-radius: 12px;
  padding: 22px 0;
  font-size: 14px;
  color: ${colors.textSub};
  cursor: ${(p) => (p.isDisabled ? 'default' : 'pointer')};
  pointer-events: ${(p) => (p.isDisabled ? 'none' : 'auto')};
  transition: all 0.25s ease;

  &:hover {
    background: #f4f4f5;
    color: ${colors.textMain};
  }
`;

export const BoostButton = styled.button`
  width: 100%;
  padding: 12px 14px;
  font-size: 15px;
  font-weight: 600;
  background: ${colors.danger};
  color: #fff;
  border: none;
  border-radius: 10px;
  margin-top: 6px;
  cursor: pointer;
  transition: background 0.25s ease;

  &:hover {
    background: ${colors.dangerHover};
  }
`;

export const ScrollableArea = styled.div`
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  margin-top: 14px;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #d4d4d8;
    border-radius: 8px;
  }
`;

export const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(121px, 1fr));
  gap: 12px;
  width: 100%;
`;

export const PreviewCard = styled.div`
  background: ${colors.bgCard};
  border-radius: 10px;
  border: 1px solid ${colors.border};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 110px;
  background: ${colors.bgSoft};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: zoom-in;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.25s ease;
  }

  &:hover img {
    transform: scale(1.03);
  }

  &:active img {
    transform: scale(0.98);
  }
`;

export const RemoveButton = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: ${colors.textSub};
  border: none;
  cursor: pointer;
  font-size: 13px;

  &:active {
    transform: scale(0.85);
  }
`;

export const CaptionArea = styled.div`
  width: 100%;
  padding: 6px 6px 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export const CaptionBox = styled.textarea`
  width: 100%;
  background: ${colors.inputBg};
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 5px 6px;
  font-size: 13px;
  resize: none;
  min-height: 32px;
  color: ${colors.textMain};
  outline: none;
`;

export const CharCount = styled.span`
  font-size: 10.5px;
  color: ${colors.textSub};
  margin-top: 2px;
`;

export const GalleryButton = styled.button`
  width: 100%;
  margin-top: 18px;
  padding: 12px 14px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: ${colors.primary};
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.25s ease;

  &:hover {
    background: ${colors.primaryHover};
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

export const ClearText = styled.span`
  margin-top: 15px;
  font-size: 12px;
  color: ${colors.textSub};
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: ${colors.textMain};
  }
`;
