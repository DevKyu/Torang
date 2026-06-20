import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { ClipLoader } from 'react-spinners';
import styled from '@emotion/styled';

const SHOW_DELAY_MS = 150;
const HIDE_GRACE_MS = 150;

const useRouteLoadingStore = create<{ count: number }>(() => ({ count: 0 }));

export const useRouteLoading = (active: boolean) => {
  useEffect(() => {
    if (!active) return;
    useRouteLoadingStore.setState((s) => ({ count: s.count + 1 }));
    return () =>
      useRouteLoadingStore.setState((s) => ({
        count: Math.max(0, s.count - 1),
      }));
  }, [active]);
};

const RouteSpinner = () => {
  const count = useRouteLoadingStore((s) => s.count);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const delay = count > 0 ? SHOW_DELAY_MS : HIDE_GRACE_MS;
    const t = setTimeout(() => setVisible(count > 0), delay);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <SpinnerScreen visible={visible}>
      <ClipLoader size={28} color="#9ca3af" />
    </SpinnerScreen>
  );
};

const SpinnerScreen = styled.div<{ visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 9990;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  opacity: ${(p) => (p.visible ? 1 : 0)};
  visibility: ${(p) => (p.visible ? 'visible' : 'hidden')};
  pointer-events: ${(p) => (p.visible ? 'auto' : 'none')};
`;

export default RouteSpinner;
