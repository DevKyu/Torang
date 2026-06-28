import { type Variants } from 'framer-motion';

export const overlayV: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0 },
};

export const cardV: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

export const fadeUp = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: 'easeOut', delay },
  },
  exit: { opacity: 0, y: 4, transition: { duration: 0.12, ease: 'easeIn' } },
});

export const itemV: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: 'easeOut', delay: (d + 1) * 0.05 },
  }),
  exit: { opacity: 0, y: 4, transition: { duration: 0.12, ease: 'easeIn' } },
};

export const popContentV: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.2 } },
};
