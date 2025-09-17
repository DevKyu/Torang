import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { ContentBox } from './commonStyle';

const colors = {
  highlight: '#fff8e1',
  highlightHover: '#ffefc1',
  topRankHover: '#fef3c7',
  defaultHover: '#f5f7fa',
  activeBg: '#fef9c3',
  activeBorder: '#fde68a',
  activeHover: '#fef3c7',
  inactiveBg: '#f1f5f9',
  inactiveBorder: '#cbd5e1',
  activeText: '#92400e',
  defaultText: '#333',
  tableHeadBg: '#f9fafb',
  border: '#e2e8f0',
  divider: '#e5e7eb',
};

export const RankingContentBox = styled(ContentBox)`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
`;

export const TableContainer = styled.div`
  position: relative;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  overflow: hidden;
  background: none;
`;

export const StyledRankingTable = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 14px;
  color: #444;
  text-align: center;

  thead {
    display: table;
    width: 100%;
    table-layout: fixed;
    background-color: ${colors.tableHeadBg};
  }

  tbody {
    display: block;
    max-height: 40vh;
    overflow-y: auto;
    width: 100%;
  }

  tbody::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }

  th,
  td {
    padding: 10px 6px;
    border-bottom: 1px solid ${colors.divider};
    white-space: nowrap;
  }
`;

export const StyledTableRow = styled.tr<{
  highlight?: boolean;
}>`
  display: table-row;
  background: ${({ highlight }) =>
    highlight ? colors.highlight : 'transparent'};
  font-weight: ${({ highlight }) => (highlight ? '600' : 'normal')};

  &:hover {
    background-color: ${({ highlight }) =>
      highlight ? colors.highlightHover : colors.defaultHover};
  }
`;

export const MotionTableRow = styled(motion.create(StyledTableRow))<{
  isLeagueEnd?: boolean;
}>`
  ${({ isLeagueEnd }) =>
    isLeagueEnd &&
    `
      border-bottom: none;
      background-image: linear-gradient(
        to right,
        transparent,
        rgba(209, 213, 219, 0.8),
        transparent
      );
      background-repeat: no-repeat;
      background-size: 100% 1.5px;
      background-position: bottom;
    `}
`;

export const FilterTabs = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

export const RankingTab = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  border: 1px solid
    ${({ active }) => (active ? colors.activeBorder : colors.inactiveBorder)};
  background-color: ${({ active }) =>
    active ? colors.activeBg : colors.inactiveBg};
  color: ${({ active }) => (active ? colors.activeText : colors.defaultText)};

  &:hover {
    background-color: ${({ active }) =>
      active ? colors.activeHover : '#e2e8f0'};
  }

  &:focus {
    outline: none;
  }

  &:active {
    background-color: ${({ active }) =>
      active ? colors.activeBorder : '#e2e8f0'};
  }
`;

export const listVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25 },
  },
};
