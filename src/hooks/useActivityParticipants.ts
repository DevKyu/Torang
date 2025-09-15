import { useEffect, useState } from 'react';
import { getActivityParticipants } from '../services/firebase';
import type { Year, Month } from '../types/UserInfo';

export const useActivityParticipants = (year: Year, month: Month) => {
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    getActivityParticipants(year, month).then(setParticipants);
  }, [year, month]);

  return participants;
};
