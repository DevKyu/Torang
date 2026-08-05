import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  style?: CSSProperties;
};

const ScreenLoadingState = ({ children, style }: Props) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
    style={style}
  >
    {children}
  </motion.div>
);

export default ScreenLoadingState;
