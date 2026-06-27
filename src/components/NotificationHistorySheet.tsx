import {
  AnimatePresence,
  animate,
  useMotionValue,
  useDragControls,
  type PanInfo,
} from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';
import { useBackClose } from '../hooks/useBackClose';
import {
  MESSAGE_TYPE_COLOR,
  MESSAGE_TYPE_LABEL,
  type MessageHistoryItem,
} from '../hooks/useMessages';
import { lockBodyScroll, unlockBodyScroll } from '../utils/bodyScrollLock';
import {
  Backdrop,
  Content,
  DragZone,
  EmptyMsg,
  Handle,
  Header,
  HistoryRow,
  HistoryRowTop,
  RowMeta,
  RowTitle,
  Sheet,
  SheetWrapper,
  Title,
  TypeBadge,
  UnreadDot,
} from '../styles/NotificationHistorySheetStyle';

type Props = {
  open: boolean;
  history: MessageHistoryItem[];
  onClose: () => void;
  onSelectMessage: (message: MessageHistoryItem) => void;
};

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const formatDate = (createdAt: string) => {
  if (createdAt.length < 12) return createdAt;
  return `${createdAt.slice(0, 4)}.${createdAt.slice(4, 6)}.${createdAt.slice(6, 8)}`;
};

const NotificationHistorySheet = ({
  open,
  history,
  onClose,
  onSelectMessage,
}: Props) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const closingRef = useRef(false);

  const runClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const height = sheetRef.current?.offsetHeight ?? 500;
    animate(y, height, { duration: 0.28, ease: EASE_OUT, onComplete: onClose });
  }, [onClose, y]);

  const resetPosition = useCallback(() => {
    animate(y, 0, { duration: 0.22, ease: EASE_OUT });
  }, [y]);

  useBackClose(open, runClose);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > 100 || info.velocity.y > 500) runClose();
      else resetPosition();
    },
    [resetPosition, runClose],
  );

  useEffect(() => {
    if (!open) return;
    closingRef.current = false;
    y.set(window.innerHeight);
    animate(y, 0, { duration: 0.34, ease: EASE_OUT });
    lockBodyScroll();
    return unlockBodyScroll;
  }, [open, y]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <SheetWrapper
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Backdrop onClick={runClose} />
        <Sheet
          ref={sheetRef}
          style={{ y }}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          <DragZone onPointerDown={(e) => dragControls.start(e)}>
            <Handle />
          </DragZone>
          <Header onPointerDown={(e) => dragControls.start(e)}>
            <Title>알림함</Title>
          </Header>
          <Content>
            {history.length === 0 ? (
              <EmptyMsg>받은 알림이 없습니다.</EmptyMsg>
            ) : (
              history.map((m) => (
                <HistoryRow key={m.id} onClick={() => onSelectMessage(m)}>
                  <HistoryRowTop>
                    {!m.read && <UnreadDot />}
                    <TypeBadge color={MESSAGE_TYPE_COLOR[m.type]}>
                      {MESSAGE_TYPE_LABEL[m.type]}
                    </TypeBadge>
                    <RowTitle read={m.read}>{m.title}</RowTitle>
                  </HistoryRowTop>
                  <RowMeta>
                    {formatDate(m.createdAt)}
                    {m.status === 'cancelled' ? ' · 취소됨' : ''}
                  </RowMeta>
                </HistoryRow>
              ))
            )}
          </Content>
        </Sheet>
      </SheetWrapper>
    </AnimatePresence>
  );
};

export default NotificationHistorySheet;
