import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const HEADER_H = 60;
export const DESC_H = 72;
export const FOOTER_H = 60;

export const topOffset = `calc(${HEADER_H}px + env(safe-area-inset-top, 0px))`;

export const getBottomOffset = (showIcon: boolean) =>
  `calc(${DESC_H + (showIcon ? FOOTER_H : 0)}px + env(safe-area-inset-bottom, 0px))`;

const stableHeight = (showIcon: boolean) => `
  max(
    300px,
    calc(100dvh - ${topOffset} - ${getBottomOffset(showIcon)} - 16px)
  )
`;

const gpu = `
  will-change: transform, opacity;
  backface-visibility: hidden;
`;

export const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(3px);
  display: flex;
  flex-direction: column;
  align-items: center;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  ${gpu}
`;

export const Header = styled.div`
  position: relative;
  width: 100%;
  height: calc(${HEADER_H}px + env(safe-area-inset-top, 0px));
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: env(safe-area-inset-top, 0px);
`;

export const TopCounter = styled.div`
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 12px;
  border-radius: 12px;
  color: #fff;
  font-size: 13px;
  -webkit-font-smoothing: antialiased;
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
  cursor: pointer;
  color: #fff;
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
  width: 100%;
  height: ${({ showIcon }) => stableHeight(showIcon)};
  min-height: 300px;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  touch-action: none;
  ${gpu}
`;

export const Slide = styled.div`
  flex: 0 0 auto;
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ViewerImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  touch-action: none;
  transition: opacity 200ms ease;
  will-change: opacity;
`;

export const NameBox = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.3;
  margin-bottom: 8px;
  pointer-events: none;
  max-width: 420px;
  text-align: center;
`;

export const DescriptionWrap = styled.div<{ showIcon: boolean }>`
  position: absolute;
  bottom: ${({ showIcon }) =>
    showIcon
      ? `calc(${FOOTER_H}px + env(safe-area-inset-bottom, 0px) + 4px)`
      : `calc(env(safe-area-inset-bottom, 0px) + 4px)`};

  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 420px;

  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
`;

export const Description = styled(motion.div)`
  width: 86%;
  max-width: 420px;
  max-height: 80px;
  overflow-y: auto;
  padding: 10px 14px;

  border-radius: 12px;
  background: rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(12px);

  color: #fff;
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
  pointer-events: auto;
  -webkit-font-smoothing: antialiased;

  font-family:
    'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;

  letter-spacing: -0.1px;
  word-break: keep-all;
  white-space: normal;

  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;

  transform: translateZ(0);
  backface-visibility: hidden;
`;

export const Footer = styled.div<{ showIcon: boolean }>`
  width: 100%;
  height: ${({ showIcon }) =>
    showIcon ? `calc(${FOOTER_H}px + env(safe-area-inset-bottom, 0px))` : '0'};
  display: ${({ showIcon }) => (showIcon ? 'flex' : 'none')};
  justify-content: center;
  align-items: flex-start;
  position: fixed;
  bottom: 0;
`;

export const FooterIcons = styled.div`
  display: flex;
  align-items: center;
  padding-top: 6px;
  gap: 32px;
`;

export const IconRow = styled.div`
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 4px;
  border-radius: 8px;

  & * {
    pointer-events: none;
  }
`;

export const Count = styled(motion.span)`
  font-size: 13px;
  color: #eee;
  line-height: 1;
`;

export const CountBox = styled.div`
  width: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
