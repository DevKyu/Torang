import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { db } from '../services/firebase';

export const useMonthParticipants = (year: string, month: number) => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const unsub = onValue(
      ref(db, `activityParticipants/${year}/${month}`),
      (snap) => {
        setParticipants(
          snap.exists() ? Object.keys(snap.val() as Record<string, true>) : [],
        );
        setLoading(false);
      },
      () => {
        setParticipants([]);
        setError(true);
        setLoading(false);
      },
    );
    return unsub;
  }, [year, month]);

  return { participants, loading, error };
};
