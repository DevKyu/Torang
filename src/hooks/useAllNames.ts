import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../services/firebase';

export const useAllNames = () => {
  const [allNames, setAllNames] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await get(ref(db, 'names'));
        if (snap.exists()) setAllNames(snap.val() as Record<string, string>);
      } catch { /* ignore */ } finally {
        setLoaded(true);
      }
    })();
  }, []);

  return { allNames, loaded };
};
