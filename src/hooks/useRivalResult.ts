import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import { calcRivalMonthResult } from '../utils/rivalResult';
import { getResultType, type Result } from '../utils/ranking';
import type { UserInfo, Year, Month } from '../types/UserInfo';
import type { YearMonth } from '../types/rival';

type Params = {
  myId: string | null;
  ym: YearMonth;
  users: Record<string, UserInfo>;
  activityYmd?: string;
  withinDays?: number;
};

export const useRivalResult = ({
  myId,
  ym,
  users,
  activityYmd,
  withinDays = 7,
}: Params) => {
  const [rivalId, setRivalId] = useState<string | null>(null);
  const [rivalName, setRivalName] = useState<string | undefined>();
  const [delta, setDelta] = useState<number | undefined>();
  const [result, setResult] = useState<Result>('none');

  useEffect(() => {
    if (!ym || !myId) return;
    const r = ref(db, `rivals/${ym}/${myId}/rivalId`);
    const off = onValue(r, (snap) => {
      setRivalId(snap.exists() ? (snap.val() as string) : null);
    });
    return () => off();
  }, [ym, myId]);

  useEffect(() => {
    if (!activityYmd || !myId || !rivalId) return;

    const today = new Date();
    const todayYmdNum = Number(
      `${today.getFullYear()}${String(today.getMonth() + 1).padStart(
        2,
        '0',
      )}${String(today.getDate()).padStart(2, '0')}`,
    );
    const activityYmdNum = Number(activityYmd);
    const diffDays = todayYmdNum - activityYmdNum;

    if (diffDays < 0 || diffDays > withinDays) return;

    const year = ym.slice(0, 4) as Year;
    const month = ym.slice(4, 6) as Month;

    const { rivalName, deltaAvg } = calcRivalMonthResult(
      myId,
      rivalId,
      users,
      year,
      month,
    );

    setRivalName(rivalName);
    setDelta(deltaAvg);
    setResult(getResultType(deltaAvg));
  }, [myId, rivalId, users, ym, activityYmd, withinDays]);

  return { rivalId, rivalName, delta, result };
};
