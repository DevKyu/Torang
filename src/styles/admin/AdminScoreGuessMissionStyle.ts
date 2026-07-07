import styled from '@emotion/styled';

export const TypeSelectRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

export const TypeSelectBtn = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1.5px solid ${({ active }) => (active ? '#3b82f6' : '#e5e7eb')};
  background: ${({ active }) => (active ? '#eff6ff' : '#fff')};
  color: ${({ active }) => (active ? '#2563eb' : '#6b7280')};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
  transition: all 0.15s;
  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      background: ${({ active }) => (active ? '#eff6ff' : '#f9fafb')};
      border-color: ${({ active }) => (active ? '#3b82f6' : '#d1d5db')};
    }
  }
  &:active:not(:disabled) {
    background: ${({ active }) => (active ? '#eff6ff' : '#f9fafb')};
    border-color: ${({ active }) => (active ? '#3b82f6' : '#d1d5db')};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const QuarterHint = styled.div`
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 10px;
`;

export const CandidateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
`;

export const CandidateRow = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ checked }) => (checked ? '#6ee7b7' : '#e5e7eb')};
  background: ${({ checked }) => (checked ? '#ecfdf5' : '#fff')};
  cursor: pointer;
  touch-action: manipulation;
  font-size: 13px;
  color: #111827;
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: ${({ checked }) => (checked ? '#d1fae5' : '#f9fafb')};
    }
  }
  &:active {
    background: ${({ checked }) => (checked ? '#d1fae5' : '#f9fafb')};
  }
`;

export const CandidateCheck = styled.span<{ checked: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${({ checked }) => (checked ? '#059669' : '#d1d5db')};
`;

export const ConfirmedBadgeRow = styled.div`
  font-size: 12px;
  color: #059669;
  margin-bottom: 10px;
  line-height: 1.6;
`;
