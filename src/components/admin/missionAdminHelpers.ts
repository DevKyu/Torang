import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import type { MissionStatus } from '../../hooks/useMission';
import { ADMIN_TOAST_SUCCESS_STYLE } from '../../styles/admin/adminToastStyle';

export const STATUS_LABEL: Record<MissionStatus, string> = {
  draft: '준비중',
  active: '공개됨',
  voting: '투표중',
  revealed: '결과공개',
};

export const toSuccessStyle = ADMIN_TOAST_SUCCESS_STYLE;

export function createIntFieldHandler<T>(
  setDraft: Dispatch<SetStateAction<T>>,
  field: keyof T,
) {
  return (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^\d]/g, '');
    setDraft((p) => ({ ...p, [field]: v === '' ? 0 : Number(v) }));
  };
}

export const createPinInputHandlers = (
  setRaw: (raw: string) => void,
  commit: (n: number) => void,
  committedValue: number,
) => ({
  onChange: (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!/^[\d.]*$/.test(raw)) return;
    setRaw(raw);
    const n = parseFloat(raw);
    if (!isNaN(n)) commit(n);
  },
  onBlur: () => setRaw(String(committedValue)),
});
