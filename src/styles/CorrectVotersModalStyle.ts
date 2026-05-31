import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const SYS_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 16000;
  background: rgba(0, 0, 0, 0.5);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

export const Card = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 320px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 65vh;
  max-height: 65dvh;
  border-top: 4px solid #10b981;
  font-family: ${SYS_FONT};
  -webkit-font-smoothing: antialiased;
`;

export const Header = styled.div`
  padding: 20px 20px 12px;
  text-align: center;
`;

export const Title = styled.div`
  font-size: 17px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 4px;
`;

export const Sub = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 0;
`;

export const ScrollArea = styled.div`
  overflow-y: auto;
  touch-action: pan-y;
  padding: 8px 20px;
  flex: 1;

  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px;
  font-size: 14px;
  color: #111827;
  border-bottom: 1px solid #f9fafb;
  &:last-child {
    border-bottom: none;
  }
`;

export const CheckWrap = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CloseBtn = styled.button`
  margin: 12px 20px;
  padding: 11px;
  background: #f0fdf4;
  color: #059669;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  &:active {
    background: #dcfce7;
  }
`;
