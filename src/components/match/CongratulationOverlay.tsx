import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';

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
} from '../../styles/shared/CongratulationOverlayStyle';

export type Result = 'win' | 'lose' | 'draw' | 'none' | 'special';

type Incoming = {
  name: string;
  result: Result;
  delta?: number;
};

type CongratulationOverlayProps = {
  open: boolean;
  onClose: () => void;
  durationMs?: number;
  message: string[];
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

const getSafeResult = (results: Result[]): Result => {
  if (results.includes('win')) return 'win';
  if (results.includes('lose')) return 'lose';
  if (results.includes('draw')) return 'draw';
  if (results.includes('special')) return 'special';
  return 'none';
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
  const messages = message;

  const results = Array.isArray(mainResult) ? mainResult : [mainResult];
  const deltas = Array.isArray(delta)
    ? delta
    : typeof delta === 'number'
      ? [delta]
      : [];

  const isTargetCase = typeof score === 'number';
  const hasConfettiFired = useRef(false);

  const safeResult: Result = getSafeResult(results);
  const hasMatchResults = results.some((r) => r !== 'none');

  useEffect(() => {
    if (!open || hasConfettiFired.current) return;
    hasConfettiFired.current = true;
    let cancelled = false;

    const t = window.setTimeout(onClose, durationMs);

    if (safeResult === 'win' || safeResult === 'special') {
      import('canvas-confetti').then(({ default: confetti }) => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (cancelled) return;
          if (safeResult === 'win') {
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
          } else {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#3b82f6', '#facc15', '#60a5fa'],
            });
          }
        });
      });
    }

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      hasConfettiFired.current = false;
    };
  }, [open, durationMs, onClose, safeResult]);

  return (
    <AnimatePresence>
      {open && (
        <Backdrop
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card
            result={safeResult}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.45, type: 'spring', delay: 0.1 }}
            whileHover={{ scale: 1.07 }}
          >
            <Emoji result={safeResult}>{EMOJI_MAP[safeResult]}</Emoji>

            {messages.map((msg, i) => (
              <ResultBlock key={i}>
                <ResultMessage count={messages.length}>{msg}</ResultMessage>

                {hasMatchResults &&
                  (isTargetCase ? (
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
                  ))}
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
