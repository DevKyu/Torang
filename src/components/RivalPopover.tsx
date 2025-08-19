import { useEffect, useMemo, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { motion } from 'framer-motion';

import { useRival } from '../hooks/useRival';
import type { YearMonth } from '../types/rival';
import { showToast } from '../utils/toast';

import {
  NameTrigger,
  Row,
  Label,
  Value,
  Actions,
  PrimaryButton,
  SubtleButton,
  POPOVER_STYLE,
} from '../styles/rivalPopoverStyle';
import { popContentV } from '../styles/rivalVariants';

export type RivalNamePopoverProps = {
  ym: YearMonth;
  myId: string | null;
  targetId: string;
  targetName: string;
  disabled?: boolean;
};

const RivalNamePopover = ({
  ym,
  myId,
  targetId,
  targetName,
  disabled,
}: RivalNamePopoverProps) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { choice, select, clear } = useRival(ym, myId);
  const isSelected = useMemo(
    () => choice?.rivalId === targetId,
    [choice, targetId],
  );

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, { passive: true });
    document
      .querySelector('tbody')
      ?.addEventListener('scroll', close, { passive: true });
    return () => {
      window.removeEventListener('scroll', close);
      document.querySelector('tbody')?.removeEventListener('scroll', close);
    };
  }, [open]);

  const pickAsync = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await select(targetId);
      showToast('라이벌을 지목했어요!');
      window.dispatchEvent(
        new CustomEvent('rival-picked', { detail: { targetId, targetName } }),
      );
    } finally {
      setBusy(false);
    }
  };

  const clearAsync = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await clear();
      showToast('라이벌 지목을 해제했어요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <NameTrigger
          type="button"
          disabled={!!disabled}
          aria-pressed={open}
          title={disabled ? '라이벌 지목이 불가합니다' : '라이벌 지목'}
          data-selected={isSelected ? 'true' : 'false'}
        >
          <span className="name" title={targetName}>
            {targetName}
          </span>
        </NameTrigger>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          asChild
          side="bottom"
          align="center"
          sideOffset={6}
          avoidCollisions
          collisionPadding={8}
        >
          <motion.div
            variants={popContentV}
            initial="hidden"
            animate="show"
            exit="exit"
            style={POPOVER_STYLE}
          >
            {isSelected ? (
              <div>
                <Row>
                  <Label>현재 라이벌</Label>
                  <Value>{targetName}</Value>
                </Row>
                <Actions>
                  <Popover.Close asChild>
                    <SubtleButton
                      type="button"
                      onClick={() => {
                        if (typeof queueMicrotask === 'function')
                          queueMicrotask(clearAsync);
                        else setTimeout(clearAsync, 0);
                      }}
                      disabled={busy}
                    >
                      해제
                    </SubtleButton>
                  </Popover.Close>
                </Actions>
              </div>
            ) : (
              <div>
                <Row>
                  <Label>라이벌로 지목할까요?</Label>
                </Row>
                <Actions>
                  <Popover.Close asChild>
                    <PrimaryButton
                      type="button"
                      onClick={() => {
                        if (typeof queueMicrotask === 'function')
                          queueMicrotask(pickAsync);
                        else setTimeout(pickAsync, 0);
                      }}
                      disabled={busy || !!disabled}
                    >
                      지목
                    </PrimaryButton>
                  </Popover.Close>
                </Actions>
              </div>
            )}

            <Popover.Arrow
              offset={6}
              style={{ fill: '#f9fafb', stroke: '#e5e7eb', strokeWidth: 1 }}
            />
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default RivalNamePopover;
