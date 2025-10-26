import { AnimatePresence, motion } from 'framer-motion';
import styled from '@emotion/styled';
import type { UserInfo } from '../types/UserInfo';

type Letter = {
  fromId: string | number;
  message: string;
  anonymous?: boolean;
  chosenAt?: number;
};

type Props = {
  letters: Letter[];
  users: Record<string, UserInfo>;
  onClose: () => void;
};

const LetterListOverlay = ({ letters, users, onClose }: Props) => {
  if (letters.length === 0) return null;

  // ✨ 바깥 영역 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick} // 👈 추가
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
                ? '익명 🎭'
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
    </AnimatePresence>
  );
};

export default LetterListOverlay;

/* --------------------- styled --------------------- */
const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(3px);
`;

const Modal = styled(motion.div)`
  background: #fffaf2;
  border: 1px solid #e0d6c8;
  border-radius: 16px;
  width: 340px;
  padding: 24px 20px;
  text-align: center;
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.4) inset;
  max-height: 70vh;
  overflow-y: auto;
`;

const Title = styled.h3`
  font-size: 1.05rem;
  font-weight: 600;
  color: #32271c;
  margin-bottom: 12px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
`;

const Item = styled.div`
  background: #fffdf8;
  border: 1px solid #e6dccd;
  border-radius: 10px;
  padding: 10px;
  text-align: left;
`;

const Sender = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: #5a4331;
  margin-bottom: 4px;
`;

const Message = styled.div`
  font-size: 0.9rem;
  color: #3a2d22;
  white-space: pre-line;
`;

const CloseButton = styled.button`
  margin-top: 8px;
  width: 100%;
  background: #d4b996;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover {
    background: #c9a77c;
  }
`;
