import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const TONE_WARM = '#EDE6D6';
const TONE_GOLD_SOFT = '#F7E3AA';

export const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  background: radial-gradient(
    78% 78% at 50% 50%,
    rgba(0, 0, 0, 0.52),
    rgba(0, 0, 0, 0.82)
  );
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

export const Card = styled(motion.div)`
  position: relative;
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  color: #fff;

  background:
    linear-gradient(180deg, rgba(22, 24, 28, 0.92), rgba(18, 20, 24, 0.92)),
    linear-gradient(0deg, rgba(246, 238, 223, 0.05), rgba(246, 238, 223, 0.05));

  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35);
  outline: 0;
  overflow: hidden;
  transform-origin: 50% 50%;

  @media (max-width: 420px) {
    padding: 20px 18px;
    border-radius: 14px;
  }
`;

export const Header = styled.div`
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${TONE_WARM};
  margin-bottom: 10px;
`;

export const Names = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
`;

export const Name = styled(motion.div)`
  font-size: clamp(20px, 4.6vw, 28px);
  font-weight: 900;
  letter-spacing: 0.2px;

  &.opponent {
    color: #f4da8b;
    text-shadow: 0 0 14px rgba(244, 218, 139, 0.22);
  }
`;

export const VS = styled(motion.div)`
  font-weight: 900;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 9999px;
  color: #7a4f12;
  background: ${TONE_GOLD_SOFT};
  border: 1px solid #f1d58d;
  box-shadow: 0 3px 10px rgba(240, 200, 110, 0.18);
`;

export const DeltaRow = styled(motion.div)`
  margin-top: 12px;
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
`;

export const DeltaLabel = styled.span`
  color: ${TONE_WARM};
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.25px;
`;

export const DeltaValue = styled.span`
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-weight: 900;

  .arrow {
    font-size: 13px;
  }
  .pts {
    font-size: 14px;
  }
  .unit {
    font-size: 12px;
    opacity: 0.95;
  }

  &[data-dir='up'] {
    color: #8ee1a4;
  }
  &[data-dir='down'] {
    color: #f5a7b0;
  }
  &[data-dir='zero'] {
    color: #d7dbe3;
  }
`;
