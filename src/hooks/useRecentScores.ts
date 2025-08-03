import { useEffect, useState } from 'react';
import type { UserScores, Month, Year } from '../types/UserInfo';

export function useRecentScores(scores?: UserScores, open?: boolean) {
  const [recent, setRecent] = useState<[string, number][] | null>(null);

  useEffect(() => {
    if (!open || recent || !scores) return;

    const temp: [string, number][] = [];
    for (const year in scores) {
      const months = scores[year as Year];
      for (const month in months) {
        const score = months[month as Month];
        if (typeof score === 'number') {
          temp.push([`${year}.${month.padStart(2, '0')}`, score]);
        }
      }
    }

    setRecent(temp.sort((a, b) => b[0].localeCompare(a[0])).slice(0, 3));
  }, [scores, open, recent]);

  return recent;
}
