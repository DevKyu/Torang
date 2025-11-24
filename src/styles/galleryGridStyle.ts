import styled from '@emotion/styled';

export const GridWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  overflow: hidden;
`;

export const GridItem = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  display: block;
`;

export const Skeleton = styled.div<{ hidden: boolean }>`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: ${(p) => (p.hidden ? 0 : 1)};
  transition: opacity 0.35s ease;

  background: linear-gradient(120deg, #f0f0f0 0%, #f7f7f7 50%, #f0f0f0 100%);
  background-size: 200% 200%;

  animation: shimmer 1.4s ease-in-out infinite;

  @keyframes shimmer {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: -200% 50%;
    }
  }
`;

export const Thumb = styled.img<{ visible: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
  opacity: ${(p) => (p.visible ? 1 : 0)};
  transition: opacity 0.35s ease;
`;
