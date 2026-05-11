import styled from '@emotion/styled';

const colors = {
  textMain: '#2d3748',
  primary: '#3b82f6',
};

export const HeaderRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 4px 0 10px;
  gap: 8px;
`;

export const MonthNavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 26px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.15);
  color: ${colors.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }

  &:active {
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
    transform: none;
  }
`;

export const MonthText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textMain};
  line-height: 1;
`;
