import { AnimatePresence, motion } from 'framer-motion';
import styled from '@emotion/styled';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

type Result = 'win' | 'lose' | 'draw' | 'none' | 'special';

type Incoming = {
  name: string;
  result: Result;
  delta?: number;
};

type Props = {
  open: boolean;
  message: string;
  onClose: () => void;
  incoming?: Incoming[];
  durationMs?: number;
  mainResult?: Result;
  delta?: number;
  compact?: boolean;
};

const RESULT_STYLES: Record<
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

const EMOJI_MAP: Record<Result, string> = {
  win: '🎉',
  lose: '🥀',
  draw: '🤝',
  special: '🎯',
  none: '🎳',
};

const CongratulationOverlay = ({
  open,
  message,
  onClose,
  incoming = [],
  durationMs = 3000,
  mainResult = 'none',
  delta,
}: Props) => {
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onClose, durationMs);

    if (mainResult === 'win') {
      requestAnimationFrame(() => {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      });
    }

    if (mainResult === 'special') {
      requestAnimationFrame(() => {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#facc15', '#60a5fa'],
        });
      });
    }

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, durationMs, onClose, mainResult]);

  return (
    <AnimatePresence>
      {open && (
        <Backdrop
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Card
            result={mainResult}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.45, type: 'spring' }}
            whileHover={{ scale: 1.07 }}
          >
            <Emoji>{EMOJI_MAP[mainResult]}</Emoji>

            <Message>{message}</Message>

            {typeof delta === 'number' && mainResult !== 'special' && (
              <Score result={mainResult}>
                {delta > 0 ? `+${delta}` : delta}점
              </Score>
            )}

            {incoming.length > 0 && (
              <IncomingList>
                <IncomingDivider />
                <strong>나를 지목한 사람</strong>
                <BadgeRow>
                  {incoming.map((i) => (
                    <Badge key={i.name} result={i.result}>
                      {i.name}
                      {typeof i.delta === 'number' && (
                        <Delta>{i.delta > 0 ? `+${i.delta}` : i.delta}</Delta>
                      )}
                    </Badge>
                  ))}
                </BadgeRow>
              </IncomingList>
            )}
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>
  );
};

export default CongratulationOverlay;

// ----------------- 스타일 -----------------
const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
`;

const Card = styled(motion.div)<{ result: Result }>`
  background: linear-gradient(145deg, #ffffff, #fafafa);
  border-radius: 18px;
  padding: 28px 20px;
  max-width: 340px;
  width: 85%;
  text-align: center;
  border: 3px solid ${(p) => RESULT_STYLES[p.result].border};
  box-shadow: 0 0 14px ${(p) => RESULT_STYLES[p.result].shadow};
`;

const Emoji = styled.div`
  font-size: 50px;
  margin-bottom: 12px;
`;

const Message = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  white-space: pre-line;
`;

const Score = styled.div<{ result: Result }>`
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

const IncomingList = styled.div`
  margin-top: 10px;
  font-size: 13px;
  color: #555;
  line-height: 1.4;
`;

const IncomingDivider = styled.div`
  margin: 4px auto 8px;
  width: 70%;
  height: 1px;
  background: #e5e7eb;
`;

const BadgeRow = styled.div`
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
`;

const Badge = styled.span<{ result: Result }>`
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

const Delta = styled.span`
  font-size: 12px;
  font-weight: 600;
`;
