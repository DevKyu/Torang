import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useBackClose } from '../../hooks/useBackClose';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock';
import {
  Backdrop,
  Card,
  RoleTag,
  MissionTitle,
  Divider,
  MessageScrollArea,
  Empty,
  CheerItem,
  CheerSender,
  CheerText,
  CloseBtn,
  CHEER_COLOR,
} from '../../styles/mission/CheerMessagesModalStyle';

export type CheerMessageEntry = {
  senderName: string;
  message: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  messages: CheerMessageEntry[];
};

const CheerMessagesModal = ({ isOpen, onClose, messages }: Props) => {
  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return unlockBodyScroll;
  }, [isOpen]);

  useBackClose(isOpen, onClose);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <Backdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <Card
            accent={CHEER_COLOR}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <RoleTag color={CHEER_COLOR}>응원 메시지</RoleTag>
            <MissionTitle>🎉 받은 응원 메시지 ({messages.length})</MissionTitle>
            <Divider />
            <MessageScrollArea>
              {messages.length === 0 ? (
                <Empty>아직 도착한 메시지가 없습니다.</Empty>
              ) : (
                messages.map((m, i) => (
                  <CheerItem key={i}>
                    <CheerSender>{m.senderName}</CheerSender>
                    <CheerText>{m.message}</CheerText>
                  </CheerItem>
                ))
              )}
            </MessageScrollArea>
            <CloseBtn onClick={onClose}>닫기</CloseBtn>
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default CheerMessagesModal;
