import { useEffect, useRef } from 'react';

const handlers = new Map<number, () => void>();
let depthSeq = 0;

function currentDepth(): number {
  return (window.history.state as { backCloseDepth?: number } | null)?.backCloseDepth ?? 0;
}

function teardownIfEmpty() {
  if (handlers.size === 0) {
    window.removeEventListener('popstate', onPopstate);
    depthSeq = 0;
  }
}

function onPopstate() {
  const target = currentDepth();
  const depths = [...handlers.keys()].reverse();
  for (const d of depths) {
    if (d <= target) break;
    const fn = handlers.get(d);
    handlers.delete(d);
    fn?.();
  }
  teardownIfEmpty();
}

export function useBackClose(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    depthSeq += 1;
    const myDepth = depthSeq;
    handlers.set(myDepth, () => onCloseRef.current());
    window.history.pushState({ backCloseDepth: myDepth }, '');

    if (handlers.size === 1) {
      window.addEventListener('popstate', onPopstate);
    }

    return () => {
      if (handlers.has(myDepth)) {
        handlers.delete(myDepth);
        const isTop = ![...handlers.keys()].some((d) => d > myDepth);
        if (isTop && currentDepth() >= myDepth) {
          window.history.back();
        }
      }
      teardownIfEmpty();
    };
  }, [isOpen]);
}
