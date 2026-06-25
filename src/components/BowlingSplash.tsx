import { memo, useState, useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useLatestRef } from '../hooks/useLatestRef';

interface BowlingSplashProps {
  onComplete: () => void;
  readyToComplete?: boolean;
}

const BALL_SIZE = 54;
const PIN_W = 20;
const PIN_H = 55;
const AIM_W = 7;
const AIM_H = 10;
const SYS_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
const LANE_LINES = ['calc(50% - 100px)', 'calc(50% + 100px)'];

const GPU: React.CSSProperties = {
  transform: 'translate3d(0,0,0)',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
};

const HOLE: React.CSSProperties = {
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(0,10,60,0.45)',
};

const LABEL_WRAPPER: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%) translate3d(0,0,0)',
  pointerEvents: 'none',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
};

const BowlingPinShape = memo(({ uid }: { uid: number }) => {
  const gId = `pg-${uid}`;

  return (
    <svg
      viewBox="0 0 20 55"
      width={PIN_W}
      height={PIN_H}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gId} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d8d8d8" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gId})`}
        d="M10,0.5 C11.5,0 16.5,2 16.5,5.5 C16.5,9 14.5,11.5 14,13.5 C14,15.5 14,17 14,18.5 C21,21.5 21,44 15,54 L5,54 C0,44 0,21.5 6,18.5 C6,17 6,15.5 6,13.5 C5.5,11.5 3.5,9 3.5,5.5 C3.5,2 8.5,0 10,0.5 Z"
      />
      <path
        fill="#C8102E"
        d="M5.5,19.5 C7,18.7 13,18.7 14.5,19.5 L14.5,22 C13,21.2 7,21.2 5.5,22 Z"
      />
      <path
        fill="#C8102E"
        d="M4.5,25 C6.5,24.2 13.5,24.2 15.5,25 L15.5,27.5 C13.5,26.7 6.5,26.7 4.5,27.5 Z"
      />
    </svg>
  );
});

const PINS = [
  { id: 0, rx: 0,   ry: 30,  sx: 0,    sy: -140 },
  { id: 1, rx: -26, ry: 0,   sx: -110, sy: -120 },
  { id: 2, rx: 26,  ry: 0,   sx: 110,  sy: -120 },
  { id: 3, rx: -52, ry: -30, sx: -140, sy: -100 },
  { id: 4, rx: 0,   ry: -30, sx: -15,  sy: -125 },
  { id: 5, rx: 52,  ry: -30, sx: 140,  sy: -100 },
  { id: 6, rx: -78, ry: -60, sx: -160, sy: -80  },
  { id: 7, rx: -26, ry: -60, sx: -80,  sy: -140 },
  { id: 8, rx: 26,  ry: -60, sx: 80,   sy: -140 },
  { id: 9, rx: 78,  ry: -60, sx: 160,  sy: -80  },
];

const SCATTER_ROTATE = [-15, -100, 100, -135, -50, 135, -160, -80, 80, 160];
const AIM_SPOTS = [-78, -52, -26, 0, 26, 52, 78];

const measureScreenH = () =>
  document.documentElement.clientHeight || window.innerHeight;

type Trajectory = 'left' | 'center' | 'right';
type Phase = 'pins' | 'rolling' | 'impact' | 'gutter' | 'fadeout';

const BowlingSplash = ({ onComplete, readyToComplete = true }: BowlingSplashProps) => {
  const [phase, setPhase] = useState<Phase>('pins');
  const [animDone, setAnimDone] = useState(false);
  const rotateControls = useAnimation();
  const onCompleteRef = useLatestRef(onComplete);

  const trajectory = useMemo<Trajectory>(() => {
    const r = Math.random();
    if (r < 0.375) return 'left';
    if (r < 0.625) return 'center';
    return 'right';
  }, []);

  const [screenH, setScreenH] = useState(measureScreenH);
  const [animArmed, setAnimArmed] = useState(false);
  const phaseRef = useLatestRef(phase);
  const animDoneRef = useLatestRef(animDone);

  // Pin fade-ins and the 'pins'->'rolling' timer run on wall-clock time, not paint time.
  // On a cold iOS Safari launch, first paint can land well after mount, so by the time the
  // user actually sees a frame those wall-clock animations may have already finished —
  // pins appear fully drawn and the ball already departing. Double-rAF confirms a real
  // paint has happened before starting either, so the visible animation always begins from
  // its own true zero regardless of how long first paint took.
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setAnimArmed(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      const inFlight =
        phaseRef.current === 'pins' ||
        phaseRef.current === 'rolling' ||
        ((phaseRef.current === 'impact' || phaseRef.current === 'gutter') &&
          !animDoneRef.current);
      if (inFlight) return;
      const h = measureScreenH();
      setScreenH((prev) => (prev !== h ? h : prev));
    };
    document.addEventListener('visibilitychange', measure);
    return () => {
      document.removeEventListener('visibilitychange', measure);
    };
  }, []);

  const pinFrontRy = -(screenH * 0.29);
  const pinYOffset = pinFrontRy - 30;
  const guideSpotBottom = screenH * 0.25;
  const ballStartY = screenH / 2 + BALL_SIZE;
  const ballEndY = pinFrontRy + PIN_H / 2 - 12;
  const ballStartOffsetX = trajectory === 'left' ? -22 : trajectory === 'right' ? 22 : 0;
  const ballDriftX = trajectory === 'left' ? -142 : trajectory === 'right' ? 142 : 0;
  const ballInitX = -BALL_SIZE / 2 + ballStartOffsetX;

  useEffect(() => {
    if (phase === 'pins') {
      if (!animArmed) return;
      const t = setTimeout(() => setPhase('rolling'), 400);
      return () => clearTimeout(t);
    }
    if (phase === 'rolling') {
      const t = setTimeout(() => {
        if (phaseRef.current === 'rolling') {
          setPhase(trajectory === 'center' ? 'impact' : 'gutter');
        }
      }, 1100);
      return () => clearTimeout(t);
    }
    if (phase === 'impact' || phase === 'gutter') {
      const t = setTimeout(() => setAnimDone(true), 800);
      return () => clearTimeout(t);
    }
  }, [phase, trajectory, animArmed]);

  useEffect(() => {
    if (!animDone || !readyToComplete) return;
    setPhase('fadeout');
    const t = setTimeout(() => onCompleteRef.current(), 900);
    return () => clearTimeout(t);
  }, [animDone, readyToComplete]);

  useEffect(() => {
    if (phase === 'rolling') {
      rotateControls.start({
        rotate: 1080,
        transition: { duration: 0.9, ease: 'linear' },
      });
    } else {
      rotateControls.stop();
    }
  }, [phase, rotateControls]);

  const isAfterRolling = phase !== 'pins';
  const isImpact = phase === 'impact';
  const isGutter = phase === 'gutter';
  const isScattered = (phase === 'impact' || phase === 'fadeout') && trajectory === 'center';

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: screenH,
        zIndex: 9999,
        background: '#09091a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        touchAction: 'none',
        cursor: readyToComplete ? 'pointer' : 'default',
        ...GPU,
        WebkitTransform: 'translate3d(0,0,0)',
      }}
      animate={{ opacity: phase === 'fadeout' ? 0 : 1 }}
      transition={{ duration: 0.9 }}
      onClick={readyToComplete ? onComplete : undefined}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background:
            'linear-gradient(to right, transparent calc(50% - 100px), rgba(255,220,130,0.02) calc(50% - 100px), rgba(255,220,130,0.02) calc(50% + 100px), transparent calc(50% + 100px))',
        }}
      />

      {LANE_LINES.map((left) => (
        <div
          key={left}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left,
            width: 2,
            background: 'rgba(255,220,130,0.18)',
          }}
        />
      ))}

      {AIM_SPOTS.map((rx) => {
        const stagger = (1 - Math.abs(rx) / 78) * 28;
        const bottomPx = guideSpotBottom + stagger;

        return (
          <svg
            key={rx}
            width={AIM_W}
            height={AIM_H}
            viewBox={`0 0 ${AIM_W} ${AIM_H}`}
            style={{
              position: 'absolute',
              left: `calc(50% + ${rx}px - ${AIM_W / 2}px)`,
              bottom: `calc(${bottomPx}px + env(safe-area-inset-bottom, 0px))`,
              overflow: 'visible',
              transform: 'translate3d(0,0,0)',
            }}
          >
            <polygon
              points={`${AIM_W / 2},0 ${AIM_W},${AIM_H} 0,${AIM_H}`}
              fill="rgba(255,210,100,0.55)"
            />
          </svg>
        );
      })}

      {animArmed && (
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          willChange: 'transform',
          ...GPU,
        }}
        animate={isImpact ? { x: [0, 5, -5, 3, -2, 0] } : { x: 0 }}
        transition={
          isImpact
            ? { duration: 0.35, ease: 'easeOut', times: [0, 0.2, 0.45, 0.7, 0.85, 1] }
            : { duration: 0.05 }
        }
      >
        {PINS.map((pin, i) => (
          <motion.div
            key={pin.id}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: PIN_W,
              height: PIN_H,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
            }}
            initial={{
              x: pin.rx - PIN_W / 2,
              y: pin.ry + pinYOffset - PIN_H / 2,
              opacity: 0,
              rotate: 0,
            }}
            animate={
              isScattered
                ? {
                    x: pin.rx - PIN_W / 2 + pin.sx,
                    y: pin.ry + pinYOffset - PIN_H / 2 + pin.sy,
                    opacity: 0,
                    rotate: SCATTER_ROTATE[i],
                  }
                : {
                    x: pin.rx - PIN_W / 2,
                    y: pin.ry + pinYOffset - PIN_H / 2,
                    opacity: 1,
                    rotate: 0,
                  }
            }
            transition={
              phase === 'pins'
                ? { delay: i * 0.04, duration: 0.25 }
                : phase === 'impact'
                  ? { duration: 0.7, delay: i * 0.04, ease: 'easeOut' }
                  : { duration: 0.3 }
            }
          >
            <BowlingPinShape uid={pin.id} />
          </motion.div>
        ))}

        <motion.div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: BALL_SIZE,
            height: BALL_SIZE,
          }}
          initial={{ x: ballInitX, y: ballStartY }}
          animate={{
            x: isAfterRolling ? -BALL_SIZE / 2 + ballDriftX : ballInitX,
            y: isAfterRolling ? ballEndY : ballStartY,
          }}
          transition={
            phase === 'rolling'
              ? trajectory === 'center'
                ? { y: { duration: 0.9, ease: 'easeIn' } }
                : {
                    x: { duration: 0.9, ease: 'easeIn' },
                    y: { duration: 0.9, ease: 'easeIn' },
                  }
              : { duration: 0.3 }
          }
          onAnimationComplete={() => {
            if (phaseRef.current === 'rolling') {
              setPhase(trajectory === 'center' ? 'impact' : 'gutter');
            }
          }}
        >
          <motion.div
            style={{
              width: BALL_SIZE,
              height: BALL_SIZE,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 33% 30%, #70b8ff, #1a4db5)',
              boxShadow:
                '0 6px 24px rgba(26,77,181,0.5), inset 0 -4px 10px rgba(0,10,60,0.4)',
              willChange: 'transform',
              ...GPU,
            }}
            animate={rotateControls}
          >
            <div style={{ ...HOLE, width: 6, height: 6, top: 12, left: 18 }} />
            <div style={{ ...HOLE, width: 6, height: 6, top: 12, left: 30 }} />
            <div style={{ ...HOLE, width: 8, height: 8, top: 22, left: 23 }} />
          </motion.div>
        </motion.div>

        {isImpact && (
          <motion.div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              x: -100,
              y: pinFrontRy - 45 - 100,
              width: 200,
              height: 200,
              borderRadius: 100,
              background:
                'radial-gradient(circle, rgba(255,210,100,0.42) 0%, rgba(255,210,100,0.18) 38%, rgba(255,210,100,0.08) 55%, transparent 72%)',
              pointerEvents: 'none',
              willChange: 'transform, opacity',
              ...GPU,
            }}
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: [0, 0.45, 0], scale: [0.1, 2.5, 3.2] }}
            transition={{ duration: 0.65, ease: 'easeOut', times: [0, 0.35, 1] }}
          />
        )}
      </motion.div>
      )}

      {isImpact && (
        <div style={LABEL_WRAPPER}>
          <motion.p
            style={{
              margin: 0,
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: '0.06em',
              color: '#FFD264',
              textShadow:
                '0 0 10px rgba(255,210,70,0.95), 0 0 22px rgba(255,175,20,0.55), 0 3px 0 rgba(0,0,0,0.45)',
              whiteSpace: 'nowrap',
              fontFamily: SYS_FONT,
              willChange: 'transform, opacity',
              ...GPU,
            }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 1, 1], scale: [0.3, 1.12, 1] }}
            transition={{ duration: 0.5, times: [0, 0.35, 1], ease: 'easeOut' }}
          >
            STRIKE!
          </motion.p>
        </div>
      )}

      {isGutter && (
        <div style={LABEL_WRAPPER}>
          <motion.p
            style={{
              margin: 0,
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#FFA040',
              textShadow:
                '0 0 16px rgba(255,110,30,0.65), 0 2px 0 rgba(0,0,0,0.4)',
              whiteSpace: 'nowrap',
              fontFamily: SYS_FONT,
              willChange: 'transform, opacity',
              ...GPU,
            }}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: [0, 1, 1], scale: [0.5, 1.1, 1], y: [10, 0, 0] }}
            transition={{ duration: 0.45, times: [0, 0.4, 1], ease: 'easeOut' }}
          >
            또랑!
          </motion.p>
        </div>
      )}
    </motion.div>
  );
};

export default BowlingSplash;
