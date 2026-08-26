import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { db } from '../services/firebase';
import type { Year, Month } from '../types/userInfo';

export const useActivityParticipants = (year: Year, month: Month) => {
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onValue(
      ref(db, `activityParticipants/${year}/${month}`),
      (snap) => {
        setParticipants(snap.exists() ? Object.keys(snap.val()) : []);
      },
      () => {
        setParticipants([]);
      },
    );
    return unsub;
  }, [year, month]);

  return participants;
};
