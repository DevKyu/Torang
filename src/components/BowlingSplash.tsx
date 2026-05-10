import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface BowlingSplashProps {
  onComplete: () => void;
}

const BALL_SIZE = 54;
const PIN_W = 20;
const PIN_H = 55;

const BowlingPinShape = ({ uid }: { uid: number }) => {
  const gId = `pg-${uid}`;
  return (
    <svg viewBox="0 0 20 55" width={PIN_W} height={PIN_H} style={{ display: 'block' }}>
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
      <path fill="#C8102E" d="M5.5,19.5 C7,18.7 13,18.7 14.5,19.5 L14.5,22 C13,21.2 7,21.2 5.5,22 Z" />
      <path fill="#C8102E" d="M4.5,25 C6.5,24.2 13.5,24.2 15.5,25 L15.5,27.5 C13.5,26.7 6.5,26.7 4.5,27.5 Z" />
    </svg>
  );
};

const PINS = [
  { id: 0, rx:   0, ry:  30, sx:    0, sy: -140 },
  { id: 1, rx: -26, ry:   0, sx: -110, sy: -120 },
  { id: 2, rx: +26, ry:   0, sx: +110, sy: -120 },
  { id: 3, rx: -52, ry: -30, sx: -140, sy: -100 },
  { id: 4, rx:   0, ry: -30, sx:  -15, sy: -125 },
  { id: 5, rx: +52, ry: -30, sx: +140, sy: -100 },
  { id: 6, rx: -78, ry: -60, sx: -160, sy:  -80 },
  { id: 7, rx: -26, ry: -60, sx:  -80, sy: -140 },
  { id: 8, rx: +26, ry: -60, sx:  +80, sy: -140 },
  { id: 9, rx: +78, ry: -60, sx: +160, sy:  -80 },
];

const SCATTER_ROTATE = [-15, -100, 100, -135, -50, 135, -160, -80, 80, 160];
const AIM_SPOTS = [-78, -52, -26, 0, 26, 52, 78];

type Trajectory = 'left' | 'center' | 'right';
type Phase = 'pins' | 'rolling' | 'impact' | 'gutter' | 'fadeout';

const BowlingSplash = ({ onComplete }: BowlingSplashProps) => {
  const [phase, setPhase] = useState<Phase>('pins');

  const trajectory = useMemo<Trajectory>(() => {
    const r = Math.random();
    if (r < 0.375) return 'left';
    if (r < 0.625) return 'center';
    return 'right';
  }, []);

  const screenH = useMemo(() => document.documentElement.clientHeight || window.innerHeight, []);
  const pinFrontRy = -(screenH * 0.29);
  const pinYOffset = pinFrontRy - 30;
  const guideSpotBottom = screenH * 0.25;
  const ballStartY = screenH / 2 + BALL_SIZE;
  const ballEndY = pinFrontRy + PIN_H / 2 - 12;
  const ballStartOffsetX = trajectory === 'left' ? -22 : trajectory === 'right' ? 22 : 0;
  const ballDriftX = trajectory === 'left' ? -142 : trajectory === 'right' ? 142 : 0;

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('rolling'), 400),
      setTimeout(() => setPhase(trajectory === 'center' ? 'impact' : 'gutter'), 1300),
      setTimeout(() => setPhase('fadeout'), 2100),
      setTimeout(onComplete, 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete, trajectory]);

  const isAfterRolling = phase !== 'pins';
  const isImpact = phase === 'impact';
  const isGutter = phase === 'gutter';
  const isScattered = (phase === 'impact' || phase === 'fadeout') && trajectory === 'center';

  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#09091a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        touchAction: 'none',
      }}
      animate={{ opacity: phase === 'fadeout' ? 0 : 1 }}
      transition={{ duration: 0.9 }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, transparent calc(50% - 100px), rgba(255,220,130,0.02) calc(50% - 100px), rgba(255,220,130,0.02) calc(50% + 100px), transparent calc(50% + 100px))',
      }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 100px)', width: 2, background: 'rgba(255,220,130,0.18)' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% + 100px)', width: 2, background: 'rgba(255,220,130,0.18)' }} />

      {AIM_SPOTS.map((rx) => {
        const w = 7;
        const h = 10;
        const stagger = (1 - Math.abs(rx) / 78) * 28;
        return (
          <svg
            key={rx}
            width={w}
            height={h}
            viewBox={`0 0 ${w} ${h}`}
            style={{
              position: 'absolute',
              left: `calc(50% + ${rx}px - ${w / 2}px)`,
              bottom: `calc(${guideSpotBottom + stagger}px + env(safe-area-inset-bottom, 0px))`,
              overflow: 'visible',
            }}
          >
            <polygon points={`${w / 2},0 ${w},${h} 0,${h}`} fill="rgba(255,210,100,0.55)" />
          </svg>
        );
      })}

      <motion.div
        style={{ position: 'absolute', inset: 0, willChange: 'transform' }}
        animate={isImpact ? { x: [0, 5, -5, 3, -2, 0] } : { x: 0 }}
        transition={isImpact
          ? { duration: 0.35, ease: 'easeOut', times: [0, 0.2, 0.45, 0.7, 0.85, 1] }
          : { duration: 0.05 }}
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
            initial={{ x: pin.rx - PIN_W / 2, y: pin.ry + pinYOffset - PIN_H / 2, opacity: 0, rotate: 0 }}
            animate={
              isScattered
                ? { x: pin.rx - PIN_W / 2 + pin.sx, y: pin.ry + pinYOffset - PIN_H / 2 + pin.sy, opacity: 0, rotate: SCATTER_ROTATE[i] }
                : { x: pin.rx - PIN_W / 2, y: pin.ry + pinYOffset - PIN_H / 2, opacity: 1, rotate: 0 }
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
            borderRadius: '50%',
            background: 'radial-gradient(circle at 33% 30%, #70b8ff, #1a4db5)',
            boxShadow: '0 6px 24px rgba(26,77,181,0.5), inset 0 -4px 10px rgba(0,10,60,0.4)',
            willChange: 'transform',
          }}
          initial={{ x: -BALL_SIZE / 2 + ballStartOffsetX, y: ballStartY }}
          animate={{
            x: isAfterRolling ? -BALL_SIZE / 2 + ballDriftX : -BALL_SIZE / 2 + ballStartOffsetX,
            y: isAfterRolling ? ballEndY : ballStartY,
            rotate: isAfterRolling ? 360 : 0,
          }}
          transition={
            phase === 'rolling'
              ? trajectory === 'center'
                ? { y: { duration: 0.9, ease: 'easeIn' }, rotate: { duration: 0.9, ease: 'linear' } }
                : { x: { duration: 0.9, ease: 'easeIn' }, y: { duration: 0.9, ease: 'easeIn' }, rotate: { duration: 0.9, ease: 'linear' } }
              : { duration: 0.3 }
          }
        >
          <div style={{ position: 'absolute', width: 7, height: 7, borderRadius: '50%', background: 'rgba(0,10,60,0.45)', top: 14, left: 22 }} />
          <div style={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: 'rgba(0,10,60,0.45)', top: 24, left: 12 }} />
          <div style={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: 'rgba(0,10,60,0.45)', top: 24, left: 25 }} />
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
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,210,100,0.45) 0%, transparent 65%)',
              filter: 'blur(6px)',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0, scale: 0.1 }}
            animate={{ opacity: [0, 0.45, 0], scale: [0.1, 2.5, 3.2] }}
            transition={{ duration: 0.65, ease: 'easeOut', times: [0, 0.35, 1] }}
          />
        )}
      </motion.div>

      {isImpact && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
          <motion.p
            style={{ margin: 0, fontSize: 36, fontWeight: 900, letterSpacing: '0.06em', color: '#FFD264', textShadow: '0 0 28px rgba(255,200,60,0.95), 0 0 60px rgba(255,170,0,0.5), 0 3px 0 rgba(0,0,0,0.45)', whiteSpace: 'nowrap', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 1, 1], scale: [0.3, 1.18, 1.0] }}
            transition={{ duration: 0.5, times: [0, 0.35, 1], ease: 'easeOut' }}
          >
            STRIKE!
          </motion.p>
        </div>
      )}

      {isGutter && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
          <motion.p
            style={{ margin: 0, fontSize: 36, fontWeight: 700, letterSpacing: '0.08em', color: '#FFA040', textShadow: '0 0 22px rgba(255,110,30,0.75), 0 2px 0 rgba(0,0,0,0.4)', whiteSpace: 'nowrap', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: [0, 1, 1], scale: [0.5, 1.1, 1.0], y: [10, 0, 0] }}
            transition={{ duration: 0.45, times: [0, 0.4, 1], ease: 'easeOut' }}
          >
            또랑또랑!
          </motion.p>
        </div>
      )}

    </motion.div>
  );
};

export default BowlingSplash;
