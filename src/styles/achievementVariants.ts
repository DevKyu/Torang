import { type Variants } from 'framer-motion';

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.15,
      when: 'beforeChildren',
      staggerChildren: 0.04,
    },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      y: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
};
