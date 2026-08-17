import { type ChangeEvent, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useBackClose } from '../../hooks/useBackClose';
import {
  Overlay,
  Modal,
  Title,
  TextArea,
  InfoRow,
  CharCount,
  CheckboxLabel,
  ErrorText,
  ButtonRow,
  PrimaryButton,
  SubtleButton,
} from '../../styles/letters/LetterOverlayStyle';

type Props = {
  targetName: string;
  open: boolean;
  onSubmit: (message: string, anonymous: boolean) => void;
  onClose: () => void;
};

const MAX_LENGTH = 50;
const MIN_LENGTH = 5;
const MAX_LINES = 3;

const LetterOverlay = ({ targetName, open, onSubmit, onClose }: Props) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  useEffect(() => {
    if (open) {
      setText('');
      setError('');
      setAnonymous(false);
    }
  }, [open, targetName]);

  useBackClose(open, onClose);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const lines = value.split('\n');

    if (lines.length > MAX_LINES) {
      setError(`최대 ${MAX_LINES}줄까지만 입력할 수 있어요.`);
      return;
    }

    if (value.length > MAX_LENGTH) {
      setError(`최대 ${MAX_LENGTH}자까지 입력할 수 있어요.`);
      return;
    }

    setError('');
    setText(value);
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('내용을 입력해주세요.');
      return;
    }
    if (trimmed.length < MIN_LENGTH) {
      setError(`${MIN_LENGTH}자 이상 입력해주세요.`);
      return;
    }

    onSubmit(trimmed, anonymous);
    onClose();
    setText('');
    setError('');
  };

  return (
    <AnimatePresence>
      {open && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Modal
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Title>🎳 {targetName}님에게 도전장을 보내요</Title>

            <TextArea
              placeholder={`도전장 메시지를 보내보세요!\n(예시: 이번엔 꼭 이기고 말겠어 🔥)`}
              value={text}
              onChange={handleChange}
              maxLength={MAX_LENGTH}
              rows={MAX_LINES}
            />

            <InfoRow>
              <CharCount>
                {text.length} / {MAX_LENGTH}
              </CharCount>

              <CheckboxLabel>
                <input
                  id="anonymous-check"
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />
                <span>익명으로 보내기 🎭</span>
              </CheckboxLabel>
            </InfoRow>

            {error && <ErrorText>{error}</ErrorText>}

            <ButtonRow>
              <SubtleButton onClick={onClose}>취소</SubtleButton>
              <PrimaryButton onClick={handleSubmit}>보내기</PrimaryButton>
            </ButtonRow>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default LetterOverlay;
