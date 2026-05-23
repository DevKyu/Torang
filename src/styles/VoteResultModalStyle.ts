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
  max-width: 360px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  max-height: 70dvh;
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
  padding: 8px 20px;
  flex: 1;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Row = styled.div<{ role?: 'villain' | 'helper' }>`
  display: grid;
  grid-template-columns: 80px 1fr 30px 14px;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 4px;
  background: ${({ role }) =>
    role === 'villain' ? '#fff5f5' : role === 'helper' ? '#eff6ff' : 'transparent'};
`;

export const Name = styled.div<{ role?: 'villain' | 'helper' }>`
  font-size: 13px;
  font-weight: ${({ role }) => (role ? '700' : '400')};
  color: ${({ role }) =>
    role === 'villain' ? '#dc2626' : role === 'helper' ? '#2563eb' : '#374151'};
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;
`;

export const RoleTag = styled.span<{ color: string }>`
  font-size: 10px;
  color: ${({ color }) => color};
  font-weight: 700;
  border: 1px solid currentColor;
  border-radius: 3px;
  padding: 1px 4px;
  line-height: 1.4;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const MyVoteIndicator = styled.div<{ visible: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #059669;
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
`;

export const BarWrap = styled.div`
  height: 7px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
`;

export const Bar = styled.div<{ pct: number; color: string }>`
  width: ${({ pct }) => pct}%;
  height: 100%;
  background: ${({ color }) => color};
  transition: width 0.5s ease;
`;

export const Count = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-align: right;
`;

export const Empty = styled.div`
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  padding: 20px 0;
`;

export const CloseBtn = styled.button`
  margin: 12px 20px;
  padding: 11px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
  &:active {
    background: #e5e7eb;
  }
`;
