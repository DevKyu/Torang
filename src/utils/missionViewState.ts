export type MissionViewState =
  | 'empty'
  | 'upcoming'
  | 'preview'
  | 'voting'
  | 'revealed';

type MissionConfigLike = {
  status?: string;
  revealDays?: number;
};

export const getDaysUntilMissionReveal = (
  activityYmd: string | number | null | undefined,
  config: MissionConfigLike | undefined,
  now: Date,
): number | null => {
  if (!activityYmd || !config) return null;
  const revealDays = config.revealDays ?? 7;
  const n = Number(activityYmd);
  const revealTimestamp =
    new Date(
      Math.floor(n / 10000),
      Math.floor((n % 10000) / 100) - 1,
      n % 100,
    ).getTime() -
    revealDays * 86400000;
  return Math.ceil((revealTimestamp - now.getTime()) / 86400000);
};

export const getMissionViewState = (
  config: MissionConfigLike | undefined,
  daysUntilReveal: number | null,
): MissionViewState => {
  if (!config || config.status === 'draft') return 'empty';
  const { status } = config;
  if (status === 'revealed') return 'revealed';
  if (status === 'voting') return 'voting';
  if (daysUntilReveal === null || daysUntilReveal > 0) return 'upcoming';
  return 'preview';
};
