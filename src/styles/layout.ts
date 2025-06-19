import styled from '@emotion/styled';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 16px;
  background-color: #f9f9f9;
`;

export const ContentBox = styled.div`
  width: 90%;
  max-width: 400px;
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;

  @media (min-width: 768px) {
    padding: 48px;
    border-radius: 20px;
  }
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;

  @media (min-width: 768px) {
    font-size: 28px;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #0070f3;
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  background-color: #0070f3;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: #005fcc;
  }
`;