import { useEffect, useState } from 'react';
//import { ref, get, update } from 'firebase/database';
import {
  // db,
  getCurrentUserId,
  // incrementPinsByEmpId,
} from '../services/firebase';
//import { showTargetWithPinToast } from '../utils/toast';
import type { UserInfo, Year, Month } from '../types/UserInfo';
import { getDiffDaysServer /*getReadableTimestamp*/ } from '../utils/date';
//import { useUiStore } from '../stores/useUiStore';

export type TargetResult = {
  show: boolean;
  achieved: boolean;
  special: boolean;
  myScore?: number;
  target?: number;
  setShow: (v: boolean) => void;
  onPinReward?: (amount: number) => void;
};
/*
export const useTargetResult = (
  user: UserInfo | null,
  ym: string,
  activityYmd?: string,
  withinDays = 7,
  onPinReward?: (amount: number) => void,
): TargetResult => {
  const [show, setShow] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [result, setResult] = useState<Omit<TargetResult, 'show' | 'setShow'>>({
    achieved: false,
    special: false,
  });

  const { getServerNow } = useUiStore.getState();

  useEffect(() => {
    if (initialized || !user || !activityYmd) return;

    const empId = getCurrentUserId();
    if (!empId) return;

    const year = activityYmd.slice(0, 4) as Year;
    const month = String(Number(activityYmd.slice(4, 6))) as Month;
    const activityYm = activityYmd.slice(0, 6);

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

    if (!isAchieved) return;

    const rewardYm = activityYm || ym;
    const rewardPath = `users/${empId}/rewards/${rewardYm}/target`;
    const rewardRef = ref(db, rewardPath);

    get(rewardRef).then(async (snap) => {
      if (snap.exists()) return;

      const pinReward = 1;
      await incrementPinsByEmpId(empId, pinReward);

      const serverNow = getServerNow();

      await update(ref(db), {
        [rewardPath]: {
          type: 'target',
          achieved: isAchieved,
          special: isSpecial,
          myScore,
          target,
          pin: pinReward,
          ym: rewardYm,
          direction: 'gain',
          createdAt: getReadableTimestamp(serverNow),
          createdAtMs: serverNow.getTime(),
        },
      });

      showTargetWithPinToast(pinReward);
      if (onPinReward) onPinReward(pinReward);
    });
  }, [user, ym, activityYmd, withinDays, initialized]);

  return { ...result, show, setShow };
}; 핀 로직 임시 제거
*/

export const useTargetResult = (
  user: UserInfo | null,
  ym: string,
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
  }, [user, ym, activityYmd, withinDays, initialized]);

  return { ...result, show, setShow };
};
