import { useMemo, useState } from 'react';
import { useUiStore } from '../stores/useUiStore';

export const useAdminMonthOptions = (startMonth2025 = 7) => {
  const [currentYm] = useState(() => {
    const now = useUiStore.getState().getServerNow();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const monthOptions = useMemo(() => {
    const options: string[] = [];
    const curY = Number(currentYm.slice(0, 4));
    const curM = Number(currentYm.slice(4));
    for (let y = 2025; y <= curY; y++) {
      const mStart = y === 2025 ? startMonth2025 : 1;
      const mEnd = y === curY ? curM : 12;
      for (let m = mStart; m <= mEnd; m++) {
        options.push(`${y}${String(m).padStart(2, '0')}`);
      }
    }
    return options.reverse();
  }, [currentYm, startMonth2025]);

  return { currentYm, monthOptions };
};
