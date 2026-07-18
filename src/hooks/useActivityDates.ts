import { useEffect, useState } from 'react';
import {
  getAllActivityDates,
  type ActivityDateAll,
} from '../services/firebase';

export const useActivityDates = () => {
  const [maps, setMaps] = useState<ActivityDateAll>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const all = await getAllActivityDates();
        if (alive) setMaps(all ?? {});
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { maps, loading, error };
};
