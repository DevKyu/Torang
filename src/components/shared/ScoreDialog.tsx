import * as Dialog from '@radix-ui/react-dialog';
import { type ReactNode, useState } from 'react';
import { X } from 'lucide-react';
import { useBackClose } from '../../hooks/useBackClose';
import { toast } from 'sonner';
import {
  Overlay,
  Content,
  Heading,
  Desc,
  Input,
  SaveBtn,
  CloseBtn,
} from '../../styles/shared/ScoreDialogStyle';

export type ScoreDialogProps = {
  monthLabel: string;
  minScore: number;
  defaultValue?: number | null;
  onSave: (val: number) => void;
  children?: ReactNode;
  trigger?: (open: () => void) => ReactNode;
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

  useBackClose(open, () => handleOpenChange(false));

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
        <Content onOpenAutoFocus={(e) => e.preventDefault()}>
          <Dialog.Title asChild>
            <Heading>{monthLabel} 목표 점수</Heading>
          </Dialog.Title>
          <Dialog.Description asChild>
            <Desc>{minScore}점 이상 입력해 주세요.</Desc>
          </Dialog.Description>

          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
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
