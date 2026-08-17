import { type MouseEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useBackClose } from '../../hooks/useBackClose';
import type { UserInfo } from '../../types/userInfo';
import {
  Overlay,
  Modal,
  Title,
  List,
  Item,
  Sender,
  Message,
  CloseButton,
} from '../../styles/letters/LetterListOverlayStyle';

type Letter = {
  fromId: string | number;
  message: string;
  anonymous?: boolean;
  chosenAt?: number;
};

type Props = {
  open: boolean;
  letters: Letter[];
  users: Record<string, UserInfo>;
  onClose: () => void;
};

const LetterListOverlay = ({ open, letters, users, onClose }: Props) => {
  useBackClose(open, onClose);

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <Modal
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Title>📬 받은 도전장</Title>

            <List>
              {letters.map((letter, i) => {
                const senderKey = String(letter.fromId);
                const senderName = letter.anonymous
                  ? '익명의 도전자'
                  : (users[senderKey]?.name ?? senderKey);

                return (
                  <Item key={`${senderKey}-${i}`}>
                    <Sender>{senderName}</Sender>
                    <Message>
                      {letter.message?.trim() ? letter.message : '메시지 없음'}
                    </Message>
                  </Item>
                );
              })}
            </List>

            <CloseButton onClick={onClose}>닫기</CloseButton>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default LetterListOverlay;
