import { useEffect, useMemo, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { motion } from 'framer-motion';
import { useMatch } from '../hooks/useMatch';
import type { YearMonth } from '../types/match';
import { showToast } from '../utils/toast';
import LetterOverlay from './LetterOverlay';
import {
  NameTrigger,
  Row,
  Label,
  Value,
  Actions,
  PrimaryButton,
  SubtleButton,
  POPOVER_STYLE,
} from '../styles/matchPopoverStyle';
import { popContentV } from '../styles/matchVariants';

export type MatchNamePopoverProps = {
  ym: YearMonth;
  myId: string | null;
  targetId: string;
  targetName: string;
  type: 'rival' | 'pin';
  disabled?: boolean;
  maxChoices?: number;
  onSendLetter?: (
    targetId: string,
    message: string,
    anonymous: boolean,
  ) => void;
};

const MatchNamePopover = ({
  ym,
  myId,
  targetId,
  targetName,
  type,
  disabled,
  maxChoices = 1,
  onSendLetter,
}: MatchNamePopoverProps) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showLetter, setShowLetter] = useState(false);

  const { choices, select, clear } = useMatch(ym, myId, type, maxChoices);

  const isSelected = useMemo(() => !!choices[targetId], [choices, targetId]);
  const reachedLimit = useMemo(
    () => Object.keys(choices).length >= maxChoices,
    [choices, maxChoices],
  );

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

  const handleSendLetter = async (message: string, anonymous: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      if (onSendLetter) {
        await onSendLetter(targetId, message, anonymous);
      } else {
        await select(targetId, message);
      }
      showToast(`${targetName}님께 도전장을 보냈어요!`, '', 'pick');
      window.dispatchEvent(
        new CustomEvent('match-picked', { detail: { targetId, targetName } }),
      );
    } catch (err: any) {
      showToast(err.message || '도전장 전송에 실패했습니다.');
    } finally {
      setBusy(false);
      setShowLetter(false);
    }
  };

  const pickAsync = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await select(targetId);
      showToast(
        type === 'pin' ? '핀 대결을 시작했어요!' : '라이벌 대결을 시작했어요!',
        '',
        'pick',
      );
      window.dispatchEvent(
        new CustomEvent('match-picked', { detail: { targetId, targetName } }),
      );
    } catch (err: any) {
      showToast(err.message || '대결에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const clearAsync = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await clear(targetId);
      showToast(
        type === 'pin' ? '핀 대결을 취소했어요.' : '도전장을 취소했어요.',
        '',
        'unpick',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <NameTrigger
            type="button"
            disabled={!!disabled}
            aria-expanded={open}
            aria-haspopup="dialog"
            title={
              disabled
                ? '대결을 할 수 없습니다.'
                : isSelected
                  ? '대결 취소 가능'
                  : reachedLimit
                    ? `최대 ${maxChoices}명까지 선택 가능`
                    : '대결 시작'
            }
            data-selected={isSelected ? 'true' : 'false'}
          >
            <span className="name" title={targetName}>
              {targetName}
            </span>
          </NameTrigger>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="center"
            sideOffset={6}
            avoidCollisions
            collisionPadding={8}
            forceMount
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <motion.div
              variants={popContentV}
              initial="hidden"
              animate={open ? 'show' : 'exit'}
              style={POPOVER_STYLE}
            >
              {isSelected ? (
                <div>
                  <Row>
                    <Label>도전 상대</Label>
                    <Value>{targetName}</Value>
                  </Row>
                  <Actions>
                    <Popover.Close asChild>
                      <SubtleButton
                        type="button"
                        onClick={() =>
                          typeof queueMicrotask === 'function'
                            ? queueMicrotask(() => clearAsync())
                            : setTimeout(clearAsync, 0)
                        }
                        disabled={busy}
                      >
                        취소
                      </SubtleButton>
                    </Popover.Close>
                  </Actions>
                </div>
              ) : reachedLimit ? (
                <div>
                  <Row>
                    <Label>최대 {maxChoices}명에게만 도전할 수 있어요..</Label>
                  </Row>
                </div>
              ) : (
                <div>
                  <Row>
                    <Label>
                      {type === 'pin'
                        ? '핀 대결을 시작할까요?'
                        : '도전장을 보낼까요?'}
                    </Label>
                  </Row>
                  <Actions>
                    <Popover.Close asChild>
                      <PrimaryButton
                        type="button"
                        onClick={() =>
                          type === 'rival'
                            ? setShowLetter(true)
                            : typeof queueMicrotask === 'function'
                              ? queueMicrotask(() => pickAsync())
                              : setTimeout(pickAsync, 0)
                        }
                        disabled={busy || !!disabled}
                      >
                        확인
                      </PrimaryButton>
                    </Popover.Close>
                  </Actions>
                </div>
              )}
            </motion.div>
            <Popover.Arrow
              offset={6}
              style={{ fill: '#f9fafb', stroke: '#e5e7eb', strokeWidth: 1 }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {type === 'rival' && (
        <LetterOverlay
          targetName={targetName}
          open={showLetter}
          onSubmit={handleSendLetter}
          onClose={() => setShowLetter(false)}
        />
      )}
    </>
  );
};

export default MatchNamePopover;
