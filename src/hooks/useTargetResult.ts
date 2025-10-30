import { useEffect, useState } from 'react';
import { ref, get, update } from 'firebase/database';
import {
  db,
  getCurrentUserId,
  incrementPinsByEmpId,
} from '../services/firebase';
import { showTargetWithPinToast } from '../utils/toast';
import type { UserInfo, Year, Month } from '../types/UserInfo';

export type TargetResult = {
  show: boolean;
  achieved: boolean;
  special: boolean;
  myScore?: number;
  target?: number;
  setShow: (v: boolean) => void;
  onPinReward?: (amount: number) => void;
};

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

  useEffect(() => {
    if (initialized || !user || !activityYmd) return;

    const empId = getCurrentUserId();
    if (!empId) return;

    const year = ym.slice(0, 4) as Year;
    const month = String(Number(ym.slice(4, 6))) as Month;

    const myScore = user.scores?.[year]?.[month];
    const target = user.targets?.[year]?.[month];
    if (typeof myScore !== 'number' || typeof target !== 'number') return;

    const todayYmd = Number(
      `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`,
    );
    const diffDays = todayYmd - Number(activityYmd);
    if (diffDays <= 0 || diffDays > withinDays) return;

    const isSpecial = myScore === target;
    const isAchieved = myScore >= target;
    setResult({ achieved: isAchieved, special: isSpecial, myScore, target });

    if (isAchieved) {
      const rewardPath = `users/${empId}/rewards/${ym}/target`;
      const rewardRef = ref(db, rewardPath);

      get(rewardRef).then(async (snap) => {
        if (snap.exists()) return;

        const pinReward = 1;
        await incrementPinsByEmpId(empId, pinReward);

        await update(ref(db), {
          [rewardPath]: {
            type: 'target',
            achieved: isAchieved,
            special: isSpecial,
            myScore,
            target,
            pin: pinReward,
            ym,
            direction: 'gain',
            createdAt: Date.now(),
          },
        });

        showTargetWithPinToast(pinReward);
        if (onPinReward) onPinReward(pinReward);
      });
    }

    setShow(true);
    setInitialized(true);
  }, [user, ym, activityYmd, withinDays, initialized]);

  return { ...result, show, setShow };
};
