import { useEffect, useRef, useState } from 'react';
import { useUiStore } from '../stores/useUiStore';

type CongratulationOptions = {
  condition: boolean;
  withinDays?: number;
  activityYmd?: string;
};

export const useCongratulation = ({
  condition,
  withinDays = 7,
  activityYmd,
}: CongratulationOptions) => {
  const [show, setShow] = useState(false);
  const firedRef = useRef(false);
  const getServerNow = useUiStore((s) => s.getServerNow);

  useEffect(() => {
    if (!activityYmd || !condition || firedRef.current) return;

    const actDate = new Date(
      Number(activityYmd.slice(0, 4)),
      Number(activityYmd.slice(4, 6)) - 1,
      Number(activityYmd.slice(6, 8)),
    );

    const serverNow = getServerNow();
    const diffDays = Math.floor(
      (serverNow.getTime() - actDate.getTime()) / 86400000,
    );

    if (diffDays < 1 || diffDays > withinDays) return;

    setShow(true);
    firedRef.current = true;
  }, [condition, activityYmd, withinDays, getServerNow]);

  return { show, setShow };
};
