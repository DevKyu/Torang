import { useEffect, type Dispatch, type SetStateAction } from 'react';

export const useClosePopoverOnScroll = (
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
) => {
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const opts = { passive: true } as const;
    window.addEventListener('scroll', close, opts);
    window.addEventListener('resize', close, opts);
    window.addEventListener('orientationchange', close, opts);
    const tbodyEl = document.querySelector('tbody');
    tbodyEl?.addEventListener('scroll', close, opts);
    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
      window.removeEventListener('orientationchange', close);
      tbodyEl?.removeEventListener('scroll', close);
    };
  }, [open, setOpen]);
};
