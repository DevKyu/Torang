import { useEffect, useRef, useState } from 'react';

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

  useEffect(() => {
    if (!condition || firedRef.current) return;

    if (activityYmd) {
      const actDate = new Date(
        Number(activityYmd.slice(0, 4)),
        Number(activityYmd.slice(4, 6)) - 1,
        Number(activityYmd.slice(6, 8)),
      );
      const diffDays = (Date.now() - actDate.getTime()) / 86400000;
      if (diffDays < 0 || diffDays > withinDays) return;
    }

    setShow(true);
    firedRef.current = true;
  }, [condition, withinDays, activityYmd]);

  return { show, setShow };
};
