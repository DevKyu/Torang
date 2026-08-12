import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import {
  setMissionStatus,
  resetMissionState,
  resetVotes,
  type MissionStatus,
  type MissionType,
  type VillainMissionData,
  type ScoreGuessMissionData,
  type TeamGuessMissionData,
} from '../../hooks/useMission';
import { ADMIN_TOAST_SUCCESS_STYLE } from '../../styles/admin/adminToastStyle';

export const STATUS_LABEL: Record<MissionStatus, string> = {
  draft: '준비중',
  active: '공개됨',
  voting: '투표중',
  revealed: '결과공개',
};

export const toSuccessStyle = ADMIN_TOAST_SUCCESS_STYLE;

type MissionDataUnion = VillainMissionData | ScoreGuessMissionData | TeamGuessMissionData | null;

export async function runMissionStatusChange(
  ym: string,
  type: MissionType,
  next: MissionStatus,
  setSaving: (v: boolean) => void,
): Promise<void> {
  setSaving(true);
  try {
    await setMissionStatus(ym, type, next);
    toast(`✅ 상태가 '${STATUS_LABEL[next]}'로 변경되었습니다.`, { position: 'top-center', duration: 2000, style: toSuccessStyle });
  } catch {
    toast.error('상태 변경 중 오류가 발생했습니다.', { position: 'top-center' });
  } finally {
    setSaving(false);
  }
}

export async function runMissionReset(
  ym: string,
  type: MissionType,
  data: MissionDataUnion,
  setSaving: (v: boolean) => void,
  setConfirmReset: (v: boolean) => void,
): Promise<void> {
  if (data?.result?.revealed && !confirm('이미 결과가 공개된 미션입니다. 초기화하면 이미 지급된 PIN이 전부 환수됩니다. 계속하시겠습니까?')) {
    return;
  }
  setSaving(true);
  try {
    await resetMissionState(ym, type, data);
    setConfirmReset(false);
    toast('✅ 미션 상태가 초기화되었습니다.', { position: 'top-center', duration: 2000, style: toSuccessStyle });
  } catch {
    toast.error('초기화 중 오류가 발생했습니다.', { position: 'top-center' });
  } finally {
    setSaving(false);
  }
}

export async function runVotesReset(
  ym: string,
  type: MissionType,
  recordLabel: string,
  setSaving: (v: boolean) => void,
): Promise<void> {
  if (!confirm(`투표를 초기화하시겠습니까? 지금까지의 ${recordLabel} 기록이 모두 삭제됩니다.`)) return;
  setSaving(true);
  try {
    await resetVotes(ym, type);
    toast('🗑️ 투표가 초기화되었습니다.', {
      position: 'top-center',
      duration: 2000,
      style: { backgroundColor: '#fef9c3', color: '#854d0e', borderRadius: '10px', fontSize: '0.875rem' },
    });
  } catch {
    toast.error('초기화 중 오류가 발생했습니다.', { position: 'top-center' });
  } finally {
    setSaving(false);
  }
}

export async function runMissionReveal(
  data: { result?: { revealed?: boolean } } | null,
  setRevealing: (v: boolean) => void,
  reveal: () => Promise<string>,
): Promise<void> {
  if (!data) return;
  const confirmMsg = data.result?.revealed
    ? '이미 공개된 결과입니다. 다시 동기화하시겠습니까? (PIN은 재지급되지 않습니다)'
    : '결과를 공개하시겠습니까? 공개 즉시 PIN이 지급됩니다.';
  if (!confirm(confirmMsg)) return;
  setRevealing(true);
  try {
    const message = await reveal();
    toast(`✅ 결과 공개 완료 — ${message}`, { position: 'top-center', duration: 3000, style: toSuccessStyle });
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : '오류가 발생했습니다.', { position: 'top-center' });
  } finally {
    setRevealing(false);
  }
}

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
