export const toYmd = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
};

export const canEditTarget = (
  todayYmd: string,
  activityYmd?: string,
  {
    isAdmin = true,
    allowWhenNoActivity = true,
  }: { isAdmin?: boolean; allowWhenNoActivity?: boolean } = {},
): boolean => {
  if (!isAdmin) return false;
  if (!activityYmd) return allowWhenNoActivity;
  if (activityYmd.length !== 8) return allowWhenNoActivity;
  return todayYmd < activityYmd;
};
