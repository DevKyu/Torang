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
  transform: translate(-50%, -50%) scale(0.96);
  width: 90%;
  max-width: 320px;
  padding: 24px 20px 20px;
  background: #fff;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0 0 0 / 0.15);
  animation: pop 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  @keyframes pop {
    to {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }
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
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
`;

export type ScoreDialogProps = {
  monthLabel: string;
  minScore: number;
  defaultValue?: number | null;
  onSave: (val: number) => void;
  children?: React.ReactNode;
  trigger?: (open: () => void) => React.ReactNode;
};

const ScoreDialog = ({
  monthLabel,
  minScore,
  defaultValue = null,
  onSave,
  children,
  trigger,
}: ScoreDialogProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>(defaultValue?.toString() ?? '');

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (o) setValue(defaultValue?.toString() ?? '');
  };

  const handleSave = () => {
    const num = Number(value);
    if (!Number.isInteger(num) || num < 0 || num > 300)
      return toast.error('0~300 사이의 점수만 입력할 수 있어요.');
    if (num < minScore)
      return toast.error(`${minScore}점 이상부터 입력할 수 있어요.`);
    onSave(num);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {trigger && trigger(() => setOpen(true))}

      {children && !trigger && (
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Overlay />
        <Content>
          <Dialog.Title asChild>
            <Heading>{monthLabel} 목표 점수</Heading>
          </Dialog.Title>
          <Dialog.Description asChild>
            <Desc>{minScore}점 이상 입력해 주세요.</Desc>
          </Dialog.Description>

          <Input
            autoFocus
            type="number"
            min={minScore}
            max={300}
            inputMode="numeric"
            value={value}
            onChange={(e) =>
              /^\d{0,3}$/.test(e.target.value) && setValue(e.target.value)
            }
          />

          <SaveBtn onClick={handleSave}>저장</SaveBtn>

          <CloseBtn aria-label="닫기">
            <X size={18} />
          </CloseBtn>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ScoreDialog;
