import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const C = {
  textMain: '#1f2937',
  textSub: '#6b7280',
  border: '#e5e7eb',
  hover: '#f9fafb',
  pos: '#2563eb',
  neg: '#dc2626',
};

export const CategoryRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 12px 0 14px;
`;

export const CategoryBtn = styled.button<{ active: boolean }>`
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 999px;
  border: 1px solid ${({ active }) => (active ? '#93c5fd' : C.border)};
  background: ${({ active }) => (active ? '#eff6ff' : '#fff')};
  color: ${({ active }) => (active ? '#2563eb' : C.textSub)};
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.15s ease;
  ${({ active }) => active && 'box-shadow: 0 2px 6px rgba(37, 99, 235, 0.18);'}
`;

export const ListFrame = styled(motion.div)`
  height: 300px;
  overflow-y: auto;
  touch-action: pan-y;
  padding: 6px 0;
  border-top: 1px solid ${C.border};
  border-bottom: 1px solid ${C.border};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
`;

export const EmptyState = styled(motion.div)`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: ${C.textSub};
`;

export const Row = styled(motion.div)`
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 3px 8px;
  padding: 7px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
  @media (hover: hover) and (pointer: fine) {
    &:hover { background: ${C.hover}; }
  }
  &:active { background: #f3f4f6; }
`;

export const Icon = styled.div`
  font-size: 17px;
  text-align: center;
  margin-top: 2px;
`;

export const ContentCell = styled.div`
  min-width: 0;
`;

export const ActivitySummaryCell = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 7px 10px;
  margin: 2px -10px -2px;
  background: #f9fafb;
  border-radius: 6px;
  border-top: 1px solid #f3f4f6;
`;

export const Title = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${C.textMain};
  letter-spacing: -0.1px;
`;

export const Desc = styled.div`
  font-size: 12px;
  color: ${C.textSub};
  margin-top: 2px;
  line-height: 1.4;
  word-break: keep-all;
`;

export const TeamInline = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: ${C.textSub};
  line-height: 1.4;

  strong {
    font-weight: 600;
    color: ${C.textMain};
    margin-right: 4px;
  }

  div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const Value = styled.div<{ positive?: boolean; draw?: boolean }>`
  min-width: 34px;
  text-align: right;
  font-size: 12px;
  font-weight: 700;
  color: ${({ draw, positive }) =>
    draw ? '#d97706' : positive === true ? C.pos : positive === false ? C.neg : C.textSub};
`;
