import { useLayoutEffect, useState, type RefObject } from 'react';

export function useScrollFade(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  deps: unknown[],
): boolean {
  const [faded, setFaded] = useState(false);

  useLayoutEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const check = () => {
      const overflowing = el.scrollHeight > el.clientHeight + 1;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 2;
      setFaded(overflowing && !atBottom);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ...deps]);

  return faded;
}
