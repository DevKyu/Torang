import { useEffect, useRef } from 'react';

const handlers: Array<() => void> = [];
let backInFlight = 0;

function onPopstate() {
  if (backInFlight > 0) {
    backInFlight--;
    return;
  }
  handlers.pop()?.();
}

export function useBackClose(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const fn = () => onCloseRef.current();
    handlers.push(fn);
    window.history.pushState({ backClose: true }, '');

    if (handlers.length === 1) {
      window.addEventListener('popstate', onPopstate);
    }

    return () => {
      const idx = handlers.lastIndexOf(fn);
      if (idx !== -1) {
        handlers.splice(idx, 1);
        backInFlight++;
        window.history.back();
      }
      if (handlers.length === 0) {
        window.removeEventListener('popstate', onPopstate);
        backInFlight = 0;
      }
    };
  }, [isOpen]);
}
