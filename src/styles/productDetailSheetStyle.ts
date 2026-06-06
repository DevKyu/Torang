import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const SheetWrapper = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 20000;
  display: flex;
  align-items: flex-end;
`;

export const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  touch-action: none;
`;

export const Sheet = styled(motion.div)`
  position: relative;
  width: 100%;
  max-height: 70vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.12);
  overflow: hidden;
`;

export const DragHandle = styled.div`
  width: 100%;
  padding: 12px 0 4px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  cursor: grab;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
`;

export const HandleBar = styled.div`
  width: 36px;
  height: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  pointer-events: none;
`;

export const SheetHeader = styled.div`
  padding: 4px 20px 14px;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SheetTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
`;

export const SheetPinBadge = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 999px;
  padding: 3px 10px;
  flex-shrink: 0;
`;

export const ImageRatioBadge = styled.span`
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 2;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(0, 0, 0, 0.42);
  border-radius: 999px;
  padding: 3px 9px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
`;

export const TextRatioBadge = styled.span`
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 10px;
`;

export const SheetBody = styled.div`
  overflow-y: auto;
  touch-action: pan-y;
  overscroll-behavior: contain;

  padding: 0 20px calc(env(safe-area-inset-bottom, 0px) + 24px);
  text-align: left;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ImageWrap = styled.div`
  position: relative;
  width: calc(100% + 40px);
  margin-left: -20px;
  max-height: 320px;
  margin-bottom: 20px;
  flex-shrink: 0;
  overflow: hidden;
  background: #fff;
  cursor: zoom-in;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ImageFg = styled.img<{ $loaded: boolean }>`
  width: 100%;
  height: auto;
  max-height: 320px;
  object-fit: contain;
  display: block;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

export const Description = styled.p`
  font-size: 14px;
  color: #374151;
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const NoDescription = styled.p`
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
`;

export const ImageViewer = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 30000;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  -webkit-tap-highlight-color: transparent;
`;

export const ImageViewerImg = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none;
  padding: 20px;
  box-sizing: border-box;
`;
