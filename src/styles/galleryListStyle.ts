import styled from '@emotion/styled';

const colors = {
  bgSoft: '#f9fafb',
  bgCard: '#ffffff',
  textMain: '#2d3748',
  textSub: '#6b7280',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
};

export const GalleryOuter = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: ${colors.bgSoft};
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const GalleryBox = styled.div`
  width: 90%;
  max-width: 400px;
  background: ${colors.bgCard};
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px 18px 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const GalleryTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.textMain};
  margin-bottom: 16px;
  text-align: center;
`;

export const AddButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: ${colors.primary};
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:active {
    transform: scale(0.96);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: ${colors.primaryHover};
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;
