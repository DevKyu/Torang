import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const HEADER_H = 60;
export const DESC_H = 72;
export const FOOTER_H = 60;

export const topOffset = `calc(${HEADER_H}px + env(safe-area-inset-top, 0px))`;
export const getBottomOffset = (showIcon: boolean) =>
  `calc(${DESC_H + (showIcon ? FOOTER_H : 0)}px + env(safe-area-inset-bottom, 0px))`;
export const getImageBoxHeight = (showIcon: boolean) =>
  `calc(100dvh - ${topOffset} - ${getBottomOffset(showIcon)})`;

const gpu = `
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform, opacity;
`;

export const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  ${gpu}
`;

export const Header = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: calc(${HEADER_H}px + env(safe-area-inset-top, 0px));
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TopCounter = styled.div`
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 12px;
  border-radius: 12px;
  color: white;
  font-size: 13px;
  ${gpu}
`;

export const HeaderRight = styled.div`
  position: absolute;
  right: 16px;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
`;

export const IconButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: white;
  opacity: 0.9;
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;

  &:active {
    transform: scale(0.9);
    opacity: 0.7;
  }

  svg {
    width: 26px;
    height: 26px;
    display: block;
  }
`;

export const ImageBox = styled.div<{ showIcon: boolean }>`
  position: absolute;
  top: ${topOffset};
  width: 100%;
  height: ${({ showIcon }) => getImageBoxHeight(showIcon)};
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  ${gpu}
`;

export const Slide = styled.div`
  flex: 0 0 auto;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  ${gpu}
`;

export const ViewerImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  ${gpu}
`;

export const DescriptionWrap = styled.div<{ showIcon: boolean }>`
  position: absolute;
  bottom: ${({ showIcon }) =>
    showIcon
      ? `calc(${FOOTER_H}px + env(safe-area-inset-bottom, 0px) + 16px)`
      : `calc(env(safe-area-inset-bottom, 0px) + 24px)`};
  width: 100%;
  display: flex;
  justify-content: center;
`;

export const Description = styled(motion.div)`
  width: 86%;
  max-width: 420px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: white;
  font-size: 14px;
  text-align: center;
  ${gpu}
`;

export const Footer = styled.div<{ showIcon: boolean }>`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: ${({ showIcon }) =>
    showIcon ? `calc(${FOOTER_H}px + env(safe-area-inset-bottom, 0px))` : '0'};
  display: ${({ showIcon }) => (showIcon ? 'flex' : 'none')};
  justify-content: center;
  align-items: flex-start;
  background: ${({ showIcon }) =>
    showIcon
      ? 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
      : 'none'};
  ${gpu}
`;

export const FooterIcons = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  padding-top: 6px;
`;

export const IconRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const Count = styled(motion.span)`
  display: block;
  font-size: 13px;
  color: #eee;
  line-height: 1;
`;

export const CountBox = styled.div`
  min-width: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
