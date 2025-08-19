import { useEffect } from 'react';

type Options = boolean | AddEventListenerOptions;

export function useEventListener<K extends string>(
  target: Window | Document | HTMLElement | null | undefined,
  type: K,
  listener: (ev: Event) => unknown,
  options?: Options,
) {
  useEffect(() => {
    if (!target?.addEventListener) return;
    target.addEventListener(type, listener as EventListener, options);
    return () =>
      target.removeEventListener(type, listener as EventListener, options);
  }, [target, type, listener, options]);
}
