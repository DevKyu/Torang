import styled from '@emotion/styled';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 16px;
  background-color: #f5f6f8;
`;

export const ContentBox = styled.div`
  width: 90%;
  max-width: 440px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  padding: 32px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 40px;
  }
`;

export const Section = styled.section`
  margin-bottom: 24px;
`;

export const Title = styled.h1`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
`;

export const PinCount = styled.p`
  font-size: 16px;
  color: #555;
  text-align: center;
`;

export const SubTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 12px;
  font-weight: 600;
`;

export const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ItemLabel = styled.label<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid ${({ disabled }) => (disabled ? '#ddd' : '#ccc')};
  border-radius: 8px;
  background-color: ${({ disabled }) => (disabled ? '#f5f5f5' : '#fff')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

export const ItemInput = styled.input`
  accent-color: #0070f3;
`;

export const Button = styled.button`
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: bold;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background-color: #005fcc;
  }
`;

export const SubText = styled.p`
  margin-top: 8px;
  font-size: 14px;
  color: #e00;
  text-align: center;
`;
