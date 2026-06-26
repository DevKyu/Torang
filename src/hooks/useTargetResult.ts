import { useEffect, useState } from 'react';
import { getCurrentUserId } from '../services/firebase';
import type { UserInfo, Year, Month } from '../types/UserInfo';
import { getDiffDaysServer } from '../utils/date';

export type TargetResult = {
  show: boolean;
  achieved: boolean;
  special: boolean;
  myScore?: number;
  target?: number;
  setShow: (v: boolean) => void;
};

export const useTargetResult = (
  user: UserInfo | null,
  activityYmd?: string,
  withinDays = 7,
): TargetResult => {
  const [show, setShow] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [result, setResult] = useState<Omit<TargetResult, 'show' | 'setShow'>>({
    achieved: false,
    special: false,
  });

  useEffect(() => {
    if (initialized || !user || !activityYmd) return;

    const empId = getCurrentUserId();
    if (!empId) return;

    const year = activityYmd.slice(0, 4) as Year;
    const month = String(Number(activityYmd.slice(4, 6))) as Month;

    const myScore = user.scores?.[year]?.[month];
    const target = user.targets?.[year]?.[month];
    if (typeof myScore !== 'number' || typeof target !== 'number') return;

    const diffDays = getDiffDaysServer(activityYmd);
    if (diffDays <= 0 || diffDays > withinDays) return;

    const isSpecial = myScore === target;
    const isAchieved = myScore >= target;

    setResult({ achieved: isAchieved, special: isSpecial, myScore, target });
    setShow(true);
    setInitialized(true);
  }, [user, activityYmd, withinDays, initialized]);

  return { ...result, show, setShow };
};
