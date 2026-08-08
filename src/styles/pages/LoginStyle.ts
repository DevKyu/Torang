import styled from '@emotion/styled';

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;

  &:focus {
    outline: none;
    border-color: #0070f3;
  }
`;

export const ErrorText = styled.p`
  color: #e00;
  font-size: 13px;
  margin-top: -8px;
  margin-bottom: 8px;
`;
