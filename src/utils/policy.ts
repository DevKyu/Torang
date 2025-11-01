import { useUiStore } from '../stores/useUiStore';

export const toYmd = (d?: Date): string => {
  const date = d ?? useUiStore.getState().getServerNow();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
};

export const canEditTarget = (
  activityYmd?: string,
  {
    isAdmin = true,
    allowWhenNoActivity = false,
    cutoffTime = '18:00',
  }: {
    isAdmin?: boolean;
    allowWhenNoActivity?: boolean;
    cutoffTime?: string;
  } = {},
): boolean => {
  if (!isAdmin) return false;
  if (!activityYmd) return allowWhenNoActivity;
  if (activityYmd.length !== 8) return allowWhenNoActivity;

  const { getServerNow } = useUiStore.getState();
  const now = getServerNow();

  const actDate = new Date(
    Number(activityYmd.slice(0, 4)),
    Number(activityYmd.slice(4, 6)) - 1,
    Number(activityYmd.slice(6, 8)),
  );

  const [hStr, mStr] = cutoffTime.split(':');
  const hour = Number(hStr) || 0;
  const minute = Number(mStr) || 0;

  const startOfActivity = actDate.getTime();
  const cutoff = new Date(actDate).setHours(hour, minute, 0, 0);

  return now.getTime() < startOfActivity || now.getTime() <= cutoff;
};
