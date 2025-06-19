import styled from '@emotion/styled';

export const CategoryButton = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${({ active }) => (active ? '#0070f3' : '#eee')};
  color: ${({ active }) => (active ? '#fff' : '#333')};
  font-size: 14px;

  &:hover {
    background-color: ${({ active }) => (active ? '#005fcc' : '#ddd')};
  }
`;

export const CategoryGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
`;
