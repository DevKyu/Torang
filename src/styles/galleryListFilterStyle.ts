import styled from '@emotion/styled';

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

export const MonthNavButton = styled.button`
  background: ${colors.primarySoft};
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: ${colors.textMain};
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;

  &:active {
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
    transform: none;
  }
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
  transition: all 0.2s ease;

  &:hover {
    background: ${(p) => (p.active ? colors.primarySoft : '#f3f4f6')};
  }

  &:active {
    transform: scale(0.94);
  }
`;

export const EmptyBox = styled.div`
  width: 100%;
  padding: 30px 0;
  text-align: center;
  color: ${colors.textSub};
  font-size: 13px;
`;
