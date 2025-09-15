import { ClipLoader } from 'react-spinners';
import styled from '@emotion/styled';
import { useLoading } from '../contexts/LoadingContext';

export const LoadingOverlay = () => {
  const { loading, loadingText } = useLoading();

  if (!loading) return null;

  return (
    <Overlay>
      <SpinnerWrapper>
        <ClipLoader color="#fff" size={40} />
        <LoadingText>{loadingText}</LoadingText>
      </SpinnerWrapper>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LoadingText = styled.p`
  margin-top: 12px;
  color: #fff;
  font-size: 16px;
`;
