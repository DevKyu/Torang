import { useEffect, useState } from 'react';
import {
  getAllActivityDates,
  type ActivityDateAll,
} from '../services/firebase';

export default function useActivityDates() {
  const [maps, setMaps] = useState<ActivityDateAll>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const all = await getAllActivityDates();
        if (alive) setMaps(all ?? {});
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { maps, loading };
}
