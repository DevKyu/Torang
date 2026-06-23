import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  MESSAGE_REACTION_EMOJIS,
  MESSAGE_TYPE_COLOR,
  setMessageReaction,
  useMessageReactionCounts,
  useMyMessageReaction,
  type AdminMessage,
  type MessageReactionKey,
} from '../hooks/useMessages';
import { lockBodyScroll, unlockBodyScroll } from '../utils/bodyScrollLock';
import { HtmlBody, PlainBody } from '../styles/MissionStyle';
import {
  Backdrop,
  Card,
  TypeTag,
  MessageTitle,
  Divider,
  ContentArea,
  ReactionRow,
  ReactionPill,
  ReactionPillCount,
  QueueIndicator,
  ConfirmBtn,
} from '../styles/MessageModalStyle';

type Props = {
  isOpen: boolean;
  message: AdminMessage | null;
  empId: string;
  queuePosition: number;
  queueLength: number;
  onClose: () => void;
  onDismiss?: () => void;
};

const MessageModal = ({
  isOpen,
  message,
  empId,
  queuePosition,
  queueLength,
  onClose,
  onDismiss,
}: Props) => {
  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return unlockBodyScroll;
  }, [isOpen]);

  const [displayMessage, setDisplayMessage] = useState(message);
  if (message && message !== displayMessage) {
    setDisplayMessage(message);
  }

  const remoteReaction = useMyMessageReaction(displayMessage?.id, empId);
  const reactionCounts = useMessageReactionCounts(isOpen, displayMessage?.id);
  const [pendingReaction, setPendingReaction] = useState<
    MessageReactionKey | null | undefined
  >(undefined);

  useEffect(() => {
    setPendingReaction(undefined);
  }, [isOpen, displayMessage?.id]);

  useEffect(() => {
    if (pendingReaction !== undefined && remoteReaction === pendingReaction) {
      setPendingReaction(undefined);
    }
  }, [remoteReaction, pendingReaction]);

  if (!displayMessage) return null;

  const myReaction =
    pendingReaction !== undefined ? pendingReaction : remoteReaction;

  const handlePickReaction = (key: MessageReactionKey) => {
    const next = myReaction === key ? null : key;
    setPendingReaction(next);
    setMessageReaction(displayMessage.id, empId, next).catch(() => {
      setPendingReaction(undefined);
    });
  };

  const isAll = displayMessage.type === 'all';
  const accent = MESSAGE_TYPE_COLOR[displayMessage.type];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <Backdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onDismiss}
        >
          <Card
            accent={accent}
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={displayMessage.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18 }}
              >
                <TypeTag color={accent}>
                  {isAll ? '📢 전체 공지' : '✉️ 메시지'}
                </TypeTag>
                <MessageTitle>{displayMessage.title}</MessageTitle>
                <Divider />
                <ContentArea color={accent}>
                  {displayMessage.content.includes('<') ? (
                    <HtmlBody
                      dangerouslySetInnerHTML={{ __html: displayMessage.content }}
                    />
                  ) : (
                    <PlainBody>{displayMessage.content}</PlainBody>
                  )}
                </ContentArea>
              </motion.div>
            </AnimatePresence>

            <ReactionRow>
              {MESSAGE_REACTION_EMOJIS.map(({ key, emoji, label }) => {
                const selected = myReaction === key;
                const count =
                  reactionCounts.find((r) => r.key === key)?.count ?? 0;
                return (
                  <ReactionPill
                    key={key}
                    type="button"
                    selected={selected}
                    color={accent}
                    aria-label={label}
                    aria-pressed={selected}
                    onClick={() => handlePickReaction(key)}
                  >
                    {emoji}
                    <AnimatePresence>
                      {count > 0 && (
                        <ReactionPillCount
                          key="count"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {count > 99 ? '99+' : count}
                        </ReactionPillCount>
                      )}
                    </AnimatePresence>
                  </ReactionPill>
                );
              })}
            </ReactionRow>

            {queueLength > 1 && (
              <QueueIndicator>
                {queuePosition} / {queueLength}
              </QueueIndicator>
            )}
            <ConfirmBtn color={accent} onClick={onClose}>
              확인
            </ConfirmBtn>
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default MessageModal;
