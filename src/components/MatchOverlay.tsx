import { useEffect, useRef, useId } from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';

import {
  Backdrop,
  Card,
  Header,
  Names,
  Name,
  VS,
  DeltaRow,
  DeltaLabel,
  DeltaValue,
} from '../styles/matchOverlayStyle';
import { overlayV, cardV, fadeUp, itemV } from '../styles/matchVariants';
import type { MatchType } from '../types/match';

export type MatchOverlayProps = {
  open: boolean;
  me: string;
  opponent: string;
  deltaAvg?: number;
  onClose: () => void;
  durationMs?: number;
  dismissible?: boolean;
  type?: MatchType;
};

const TITLE_MAP = {
  rival: '라이벌 매치',
  pin: '핀 쟁탈전 매치',
} as const;

const MatchOverlay = ({
  open,
  me,
  opponent,
  deltaAvg,
  onClose,
  durationMs = 1400,
  dismissible = true,
  type = 'rival',
}: MatchOverlayProps) => {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const labelId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let t: number | undefined;
    const baseMs = Math.max(durationMs ?? 1400, 0);
    const autoMs = baseMs === 0 ? 0 : reduced ? Math.min(baseMs, 800) : baseMs;
    if (autoMs > 0) t = window.setTimeout(onClose, autoMs);

    const onKey = (e: KeyboardEvent) => {
      if (dismissible && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    containerRef.current?.focus();

    return () => {
      if (t) window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, durationMs, reduced, dismissible, onClose]);

  const dir: 'up' | 'down' | 'zero' =
    typeof deltaAvg !== 'number'
      ? 'zero'
      : deltaAvg < 0
        ? 'up'
        : deltaAvg > 0
          ? 'down'
          : 'zero';

  const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '–';
  const diffPoints =
    typeof deltaAvg === 'number' ? Math.round(Math.abs(deltaAvg)) : undefined;

  return (
    <AnimatePresence>
      {open && (
        <Backdrop
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          aria-describedby={descId}
          variants={overlayV}
          initial="hidden"
          animate="show"
          exit="exit"
          onClick={() => dismissible && onClose()}
        >
          <Card
            variants={cardV}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            ref={containerRef}
          >
            <Header id={labelId}>{TITLE_MAP[type]}</Header>

            <Names>
              <Name variants={itemV} custom={-1}>
                {me}
              </Name>
              <VS variants={itemV} custom={0}>
                VS
              </VS>
              <Name className="opponent" variants={itemV} custom={+1}>
                {opponent}
              </Name>
            </Names>

            {typeof diffPoints === 'number' && (
              <DeltaRow variants={fadeUp(0.15)} initial="hidden" animate="show">
                <DeltaLabel id={descId}>점수 차이</DeltaLabel>
                <DeltaValue
                  data-dir={dir}
                  aria-label={
                    dir === 'up'
                      ? `상대가 나보다 ${diffPoints}점 높음`
                      : dir === 'down'
                        ? `내가 상대보다 ${diffPoints}점 높음`
                        : `동일`
                  }
                >
                  <span className="arrow">{arrow}</span>
                  <strong className="pts">{diffPoints}</strong>
                  <span className="unit">점</span>
                </DeltaValue>
              </DeltaRow>
            )}
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>
  );
};

export default MatchOverlay;
