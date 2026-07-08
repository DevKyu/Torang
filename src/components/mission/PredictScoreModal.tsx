import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { useBackClose } from '../../hooks/useBackClose';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock';
import {
  Backdrop,
  Card,
  Heading,
  InputRow,
  Input,
  InputUnit,
  MessageArea,
  MessageInfoRow,
  CharCount,
  CheckboxLabel,
  SaveBtn,
  CancelBtn,
} from '../../styles/mission/PredictScoreModalStyle';

const MESSAGE_MAX_LENGTH = 50;
const MESSAGE_MAX_LINES = 3;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  onSubmit: (
    predictedScore: number,
    message: string,
    anonymous: boolean,
  ) => Promise<void> | void;
  submitting?: boolean;
};

const PredictScoreModal = ({
  isOpen,
  onClose,
  targetName,
  onSubmit,
  submitting = false,
}: Props) => {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setMessage('');
      setAnonymous(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return unlockBodyScroll;
  }, [isOpen]);

  useBackClose(isOpen, onClose);

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    if (next.split('\n').length > MESSAGE_MAX_LINES) return;
    if (next.length > MESSAGE_MAX_LENGTH) return;
    setMessage(next);
  };

  const handleSave = async () => {
    const num = Number(value);
    if (!Number.isInteger(num) || num < 1 || num > 300) {
      toast.error('1~300 사이의 점수만 입력할 수 있어요.', {
        position: 'top-center',
      });
      return;
    }
    await onSubmit(num, message.trim(), anonymous);
  };

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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <Heading>🎳 {targetName}님의 이번 달 점수는?</Heading>
            <InputRow>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={value}
                onChange={(e) => {
                  const next = e.target.value;
                  if (!/^\d{0,3}$/.test(next)) return;
                  if (next !== '' && Number(next) > 300) return;
                  setValue(next);
                }}
              />
              <InputUnit>점</InputUnit>
            </InputRow>
            <MessageArea
              placeholder="응원의 한마디를 남겨보세요! (선택)"
              value={message}
              onChange={handleMessageChange}
              maxLength={MESSAGE_MAX_LENGTH}
              rows={MESSAGE_MAX_LINES}
            />
            <MessageInfoRow>
              <CharCount>
                {message.length} / {MESSAGE_MAX_LENGTH}
              </CharCount>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />
                익명으로 보내기
              </CheckboxLabel>
            </MessageInfoRow>
            <SaveBtn onClick={handleSave} disabled={!value || submitting}>
              {submitting ? '예측 중...' : '예측하기'}
            </SaveBtn>
            <CancelBtn onClick={onClose}>취소</CancelBtn>
          </Card>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default PredictScoreModal;
