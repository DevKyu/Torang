import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Backdrop,
  Card,
  Emoji,
  Message,
  ScoreText,
  DeltaBadge,
  IncomingList,
  IncomingDivider,
  BadgeRow,
  Badge,
  Delta,
} from '../styles/CongratulationOverlayStyle';

type Result = 'win' | 'lose' | 'draw' | 'none' | 'special';

type Incoming = {
  name: string;
  result: Result;
  delta?: number;
};

type CongratulationOverlayProps = {
  open: boolean;
  message: string;
  onClose: () => void;
  incoming?: Incoming[];
  durationMs?: number;
  mainResult?: Result;
  delta?: number;
  score?: number;
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
  score,
}: CongratulationOverlayProps) => {
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
            <Emoji result={mainResult}>{EMOJI_MAP[mainResult]}</Emoji>

            <Message>{message}</Message>

            {typeof score === 'number' && (
              <ScoreText>점수 : {score}점</ScoreText>
            )}

            {typeof delta === 'number' && mainResult !== 'special' && (
              <DeltaBadge result={mainResult}>
                {delta > 0 ? `+${delta}` : delta}점
              </DeltaBadge>
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
