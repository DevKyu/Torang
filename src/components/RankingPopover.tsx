import { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { motion } from 'framer-motion';

import { useRecentScores } from '../hooks/useRecentScores';
import type { RankingEntry } from '../types/Ranking';

import {
  popoverStyle,
  TriggerButton,
  ScoreRow,
  DateText,
  ScoreText,
  EmptyText,
} from '../styles/rankingPopoverStyle';

const RankingPopover = ({ user }: { user: RankingEntry }) => {
  const [open, setOpen] = useState(false);
  const recent = useRecentScores(user.scores, open);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const opts = { passive: true } as const;

    window.addEventListener('scroll', close, opts);
    window.addEventListener('resize', close, opts);
    window.addEventListener('orientationchange', close, opts);

    const tbodyEl = document.querySelector('tbody');
    tbodyEl?.addEventListener('scroll', close, opts);

    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
      window.removeEventListener('orientationchange', close);
      tbodyEl?.removeEventListener('scroll', close);
    };
  }, [open]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <TriggerButton
          aria-expanded={open}
          aria-haspopup="dialog"
          title="최근 점수 보기"
        >
          {user.average}
        </TriggerButton>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="center"
          sideOffset={4}
          avoidCollisions
          collisionPadding={8}
          forceMount
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={popoverStyle}
          >
            {recent?.length ? (
              recent.map(([date, score], index) => (
                <ScoreRow
                  key={date}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <DateText>{date}</DateText>
                  <ScoreText>{score}</ScoreText>
                </ScoreRow>
              ))
            ) : (
              <EmptyText>점수 없음</EmptyText>
            )}
          </motion.div>

          <Popover.Arrow
            offset={6}
            style={{ fill: '#f9fafb', stroke: '#e5e7eb', strokeWidth: 1 }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default RankingPopover;
