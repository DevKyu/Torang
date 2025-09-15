import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Backdrop,
  Card,
  Emoji,
  ScoreText,
  IncomingList,
  IncomingDivider,
  BadgeRow,
  Badge,
  Delta,
  ResultBlock,
  ResultMessage,
  ResultDeltaBadge,
} from '../styles/CongratulationOverlayStyle';

type Result = 'win' | 'lose' | 'draw' | 'none' | 'special';

type Incoming = {
  name: string;
  result: Result;
  delta?: number;
};

type CongratulationOverlayProps = {
  open: boolean;
  onClose: () => void;
  durationMs?: number;

  message?: string | string[];
  mainResult?: Result | Result[];
  delta?: number | number[];
  score?: number;
  incoming?: Incoming[];
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
  onClose,
  durationMs = 3000,
  message,
  mainResult = 'none',
  delta,
  score,
  incoming = [],
}: CongratulationOverlayProps) => {
  const messages = Array.isArray(message) ? message : message ? [message] : [];
  const results = Array.isArray(mainResult) ? mainResult : [mainResult];
  const deltas = Array.isArray(delta)
    ? delta
    : typeof delta === 'number'
      ? [delta]
      : [];

  const isMulti = results.length > 1;
  const isTargetCase = typeof score === 'number';
  const hasConfettiFired = useRef(false);

  useEffect(() => {
    if (!open || hasConfettiFired.current) return;
    hasConfettiFired.current = true;

    const t = window.setTimeout(onClose, durationMs);

    if (!isMulti) {
      const firstResult = results[0] ?? 'none';

      if (firstResult === 'win' || isTargetCase) {
        requestAnimationFrame(() => {
          confetti({
            particleCount: 60,
            spread: 60,
            angle: 60,
            origin: { x: 0, y: 0.6 },
          });
          confetti({
            particleCount: 60,
            spread: 60,
            angle: 120,
            origin: { x: 1, y: 0.6 },
          });
        });
      }

      if (firstResult === 'special') {
        requestAnimationFrame(() => {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#facc15', '#60a5fa'],
          });
        });
      }
    }

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      hasConfettiFired.current = false;
    };
  }, [open, durationMs, onClose, results, isMulti, isTargetCase]);

  return (
    <AnimatePresence>
      {open && (
        <Backdrop role="dialog" aria-modal="true">
          <Card
            result={isMulti ? 'none' : results[0]}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.45, type: 'spring' }}
            whileHover={{ scale: 1.07 }}
          >
            <Emoji result={isMulti ? 'none' : results[0]}>
              {isMulti ? EMOJI_MAP['none'] : EMOJI_MAP[results[0]]}
            </Emoji>

            {messages.map((msg, i) => (
              <ResultBlock key={i}>
                <ResultMessage count={messages.length}>{msg}</ResultMessage>

                {isTargetCase ? (
                  <>
                    {typeof score === 'number' && (
                      <ScoreText>점수 : {score}점</ScoreText>
                    )}
                    {typeof deltas[i] === 'number' &&
                      results[i] !== 'special' && (
                        <ResultDeltaBadge
                          result={results[i]}
                          count={messages.length}
                        >
                          {deltas[i]! > 0 ? `+${deltas[i]}` : deltas[i]}점
                        </ResultDeltaBadge>
                      )}
                  </>
                ) : (
                  <>
                    {typeof deltas[i] === 'number' &&
                      results[i] !== 'special' && (
                        <ResultDeltaBadge
                          result={results[i]}
                          count={messages.length}
                        >
                          {deltas[i]! > 0 ? `+${deltas[i]}` : deltas[i]}점
                        </ResultDeltaBadge>
                      )}
                    {typeof score === 'number' && (
                      <ScoreText>점수 : {score}점</ScoreText>
                    )}
                  </>
                )}
              </ResultBlock>
            ))}

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
