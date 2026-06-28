import { Component, type ReactNode } from 'react';
import styled from '@emotion/styled';
import { Button } from '../../styles/global/commonStyle';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Render error caught by ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen>
          <p>문제가 발생했어요.</p>
          <Button onClick={() => window.location.reload()}>새로고침</Button>
        </ErrorScreen>
      );
    }
    return this.props.children;
  }
}

const ErrorScreen = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9995;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  align-items: center;
  padding: 0 32px;
  background: #fff;
  text-align: center;

  p {
    font-size: 15px;
    color: #374151;
  }

  button {
    max-width: 240px;
  }
`;

export default ErrorBoundary;
