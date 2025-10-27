import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styled from '@emotion/styled';

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
  width: 320px;
  padding: 24px 20px;
  text-align: center;
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.4) inset;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #32271c;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 90px;
  border: 1px solid #e2d9cd;
  border-radius: 10px;
  padding: 10px;
  background: #fffdf8;
  resize: none;
  font-size: 0.9rem;
  color: #3a2d22;
  outline: none;
  line-height: 1.5;
  overflow-y: auto;
  white-space: pre-wrap;

  &:focus {
    border-color: #d4b996;
    box-shadow: 0 0 0 2px rgba(212, 185, 150, 0.25);
    background: #fffaf2;
  }

  &::placeholder {
    color: #b6a896;
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
`;

const CharCount = styled.span`
  font-size: 0.75rem;
  color: #8b7d6b;
`;

const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #5a4c3e;
  cursor: pointer;
  user-select: none;

  input {
    accent-color: #d4b996;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  span {
    cursor: pointer;
  }
`;

const ErrorText = styled.p`
  margin-top: 6px;
  font-size: 0.8rem;
  color: #c2554f;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
`;

const BaseButton = styled.button`
  flex: 1;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  padding: 8px 0;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.1s ease;
  font-weight: 500;

  &:active {
    transform: scale(0.97);
  }
`;

const PrimaryButton = styled(BaseButton)`
  background: #d4b996;
  color: white;
  &:hover {
    background: #c9a77c;
  }
`;

const SubtleButton = styled(BaseButton)`
  background: #f3efe8;
  color: #4b3f35;
  &:hover {
    background: #ece5dc;
  }
`;
