import styled from '@emotion/styled';

export { MonthNavButton } from '../activity/MonthNavigatorStyle';

const colors = {
  textMain: '#2d3748',
  textSub: '#6b7280',
  border: '#e5e7eb',
  primary: '#3b82f6',
  primarySoft: '#eff6ff',
};

export const HeaderRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  gap: 8px;
`;

export const MonthText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  color: ${colors.textMain};
  line-height: 1;
`;

export const FilterRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 8px 0 14px;
`;

export const FilterButton = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 14px;
  border: 1px solid ${(p) => (p.active ? colors.primary : colors.border)};
  background: ${(p) => (p.active ? colors.primarySoft : '#fff')};
  color: ${(p) => (p.active ? colors.primary : colors.textSub)};
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: ${(p) => (p.active ? colors.primarySoft : '#f3f4f6')};
    }
  }

  &:active {
    transform: scale(0.94);
  }
`;

export const EmptyBox = styled.div`
  width: 100%;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.textSub};
  font-size: 13px;
`;
