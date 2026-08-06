import styled from '@emotion/styled';
import { ContentBox } from '../global/commonStyle';

export const OuterWrapper = styled.div`
  height: 100vh;
  height: 100dvh;
  overflow-y: scroll;
  touch-action: pan-y;
`;

export const AdminBox = styled(ContentBox)`
  max-width: 720px;
  padding: 28px 32px 20px;
  text-align: left;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;
