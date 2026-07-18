import { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { db } from '../services/firebase';

export const useMonthParticipants = (year: string, month: number) => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    get(ref(db, `activityParticipants/${year}/${month}`))
      .then((snap) => {
        if (cancelled) return;
        setParticipants(
          snap.exists() ? Object.keys(snap.val() as Record<string, true>) : [],
        );
      })
      .catch(() => {
        if (!cancelled) {
          setParticipants([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  return { participants, loading, error };
};
