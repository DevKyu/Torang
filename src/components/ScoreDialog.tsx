import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { X } from 'lucide-react';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';

const Overlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  background: rgba(0 0 0 / 0.5);
  backdrop-filter: blur(2px);
  animation: fadeIn 0.18s ease-out forwards;
  z-index: 1000;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Content = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 320px;
  padding: 24px 20px 20px;
  background: #fff;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0 0 0 / 0.15);
  z-index: 1001;
`;

const Heading = styled.h3`
  font: 600 18px/1.25 sans-serif;
  margin-bottom: 14px;
`;
const Desc = styled.p`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 18px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  font-size: 16px;
  text-align: center;
  border: 1px solid #d0d7e2;
  border-radius: 10px;
  margin-bottom: 18px;
  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

const SaveBtn = styled.button`
  width: 100%;
  padding: 10px 0;
  border: none;
  border-radius: 10px;
  background: #3b82f6;
  color: #fff;
  font: 600 15px/1 sans-serif;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: #2563eb;
  }
`;

const CloseBtn = styled(Dialog.Close)`
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  background: none;
  cursor: pointer;
  color: #64748b;
`;

export type ScoreDialogProps = {
  monthLabel: string;
  minScore: number;
  defaultValue?: number;
  onSave: (val: number) => void;
  children: React.ReactNode;
};

const ScoreDialog = ({
  monthLabel,
  minScore,
  defaultValue,
  onSave,
  children,
}: ScoreDialogProps) => {
  const [value, setValue] = useState(defaultValue?.toString() ?? '');

  const handleSave = () => {
    const num = Number(value);
    if (!Number.isInteger(num) || num < 0 || num > 300)
      return toast.error('0~300의 점수만 입력할 수 있어요.');
    if (num < minScore)
      return toast.error(`${minScore}점 이상부터 입력할 수 있어요.`);
    onSave(num);
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Overlay />

      <Content>
        <Dialog.Title asChild>
          <Heading>{monthLabel} 목표 점수</Heading>
        </Dialog.Title>
        <Dialog.Description asChild>
          <Desc>{minScore}점 이상 입력해 주세요.</Desc>
        </Dialog.Description>

        <Input
          type="number"
          min={minScore}
          max={300}
          step={1}
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^\d{0,3}$/.test(v)) setValue(v);
          }}
        />

        <Dialog.Close asChild>
          <SaveBtn onClick={handleSave}>확인</SaveBtn>
        </Dialog.Close>

        <CloseBtn aria-label="닫기">
          <X size={18} />
        </CloseBtn>
      </Content>
    </Dialog.Root>
  );
};

export default ScoreDialog;
