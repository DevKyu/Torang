import styled from '@emotion/styled';

export const ItemLabel = styled.label<{ disabled?: boolean }>`
  display: block;
  padding: 10px 14px;
  border: 1px solid ${({ disabled }) => (disabled ? '#ddd' : '#ccc')};
  border-radius: 8px;
  background-color: ${({ disabled }) => (disabled ? '#f5f5f5' : '#fff')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  margin-bottom: 12px;
  transition: border 0.2s ease;

  &:hover {
    border-color: ${({ disabled }) => (disabled ? '#ddd' : '#0070f3')};
  }
`;

export const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ItemInput = styled.input`
  accent-color: #0070f3;
`;

export const ItemContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const Badge = styled.span`
  background-color: #eee;
  color: #333;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 13px;
`;
