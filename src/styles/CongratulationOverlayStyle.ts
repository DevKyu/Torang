import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export type Result = 'win' | 'lose' | 'draw' | 'none' | 'special';

export const RESULT_STYLES: Record<
  Result,
  { border: string; shadow: string; bg: string; text: string }
> = {
  win: {
    border: '#4ade80',
    shadow: 'rgba(74,222,128,0.4)',
    bg: 'rgba(74,222,128,0.15)',
    text: '#166534',
  },
  lose: {
    border: '#f87171',
    shadow: 'rgba(248,113,113,0.35)',
    bg: 'rgba(248,113,113,0.15)',
    text: '#991b1b',
  },
  draw: {
    border: '#facc15',
    shadow: 'rgba(250,204,21,0.35)',
    bg: 'rgba(250,204,21,0.2)',
    text: '#854d0e',
  },
  special: {
    border: '#3b82f6',
    shadow: 'rgba(59,130,246,0.35)',
    bg: 'rgba(59,130,246,0.15)',
    text: '#1d4ed8',
  },
  none: {
    border: '#9ca3af',
    shadow: 'rgba(156,163,175,0.2)',
    bg: 'rgba(156,163,175,0.15)',
    text: '#374151',
  },
};

export const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
`;

export const Card = styled(motion.div)<{ result: Result }>`
  background: linear-gradient(145deg, #ffffff, #fafafa);
  border-radius: 18px;
  padding: 28px 20px;
  max-width: 340px;
  width: 85%;
  text-align: center;
  border: 3px solid ${(p) => RESULT_STYLES[p.result].border};
  box-shadow: 0 0 14px ${(p) => RESULT_STYLES[p.result].shadow};
`;

export const Emoji = styled.div<{ result: Result }>`
  font-size: 50px;
  margin-bottom: 16px;
  display: inline-block;

  ${(p) =>
    p.result === 'win' &&
    `animation: bounce 0.9s cubic-bezier(.28,.84,.42,1) infinite;`}
  ${(p) => p.result === 'lose' && `animation: shake 0.6s ease-in-out;`}
  ${(p) => p.result === 'draw' && `animation: pulse 1.4s ease-in-out infinite;`}
  ${(p) =>
    p.result === 'special' &&
    `animation: glow 1.6s ease-in-out infinite alternate;`}
  ${(p) =>
    p.result === 'none' && `animation: wobble 1.5s ease-in-out infinite;`}

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0) rotate(0);
    }
    20% {
      transform: translateX(-6px) rotate(-3deg);
    }
    40% {
      transform: translateX(5px) rotate(2deg);
    }
    60% {
      transform: translateX(-4px) rotate(-2deg);
    }
    80% {
      transform: translateX(3px) rotate(1deg);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.9;
    }
    50% {
      transform: scale(1.12);
      opacity: 1;
    }
  }

  @keyframes glow {
    0%,
    100% {
      text-shadow:
        0 0 3px #3b82f6,
        0 0 6px #60a5fa;
    }
    50% {
      text-shadow:
        0 0 8px #2563eb,
        0 0 14px #93c5fd;
    }
  }

  @keyframes wobble {
    0% {
      transform: translateX(0) rotate(0deg);
    }
    25% {
      transform: translateX(3px) rotate(6deg);
    }
    50% {
      transform: translateX(0) rotate(0deg);
    }
    75% {
      transform: translateX(-3px) rotate(-6deg);
    }
    100% {
      transform: translateX(0) rotate(0deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    & {
      animation: none !important;
    }
  }
`;

export const Message = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  white-space: pre-line;
`;

export const ScoreText = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #555;
  margin: 4px 0 8px;
`;

export const DeltaBadge = styled.div<{ result: Result }>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 4px auto 8px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  background: ${(p) => RESULT_STYLES[p.result].bg};
  color: ${(p) => RESULT_STYLES[p.result].text};
`;

export const IncomingList = styled.div`
  margin-top: 10px;
  font-size: 13px;
  color: #555;
  line-height: 1.4;
`;

export const IncomingDivider = styled.div`
  margin: 4px auto 8px;
  width: 70%;
  height: 1px;
  background: #e5e7eb;
`;

export const BadgeRow = styled.div`
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
`;

export const Badge = styled.span<{ result: Result }>`
  padding: 6px 10px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${(p) => RESULT_STYLES[p.result].border};
  color: #fff;
  cursor: default;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
`;

export const Delta = styled.span`
  font-size: 12px;
  font-weight: 600;
`;

export const ResultBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 6px;
`;

export const ResultMessage = styled(Message)<{ count: number }>`
  font-size: ${({ count }) => (count > 1 ? '16px' : '18px')};
`;

export const ResultDeltaBadge = styled(DeltaBadge)<{
  result: Result;
  count: number;
}>`
  font-size: ${({ count }) => (count > 1 ? '12px' : '13px')};
`;
