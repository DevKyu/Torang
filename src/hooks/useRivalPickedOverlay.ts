import { useCallback, useMemo, useRef, useState } from 'react';
import { useEventListener } from './useEventListener';
import { useLatestRef } from './useLatestRef';
import {
  EVENT_RIVAL_PICKED,
  type RivalPickedDetail,
} from '../constants/events';
import type { RankingEntry, RankingType } from '../types/Ranking';
import { calcRivalResult } from '../utils/rivalResult';

type Params = {
  rankingType: RankingType;
  ranking: RankingEntry[];
  myId: string | null;
  enabled?: boolean;
  cooldownMs?: number;
};

export function useRivalPickedOverlay({
  rankingType,
  ranking,
  myId,
  enabled = true,
  cooldownMs = 1000,
}: Params) {
  const [open, setOpen] = useState(false);
  const [rivalName, setRivalName] = useState('');
  const [deltaAvg, setDeltaAvg] = useState<number | undefined>(undefined);

  const rankingTypeRef = useLatestRef(rankingType);
  const entryMap = useMemo(() => {
    const m = new Map<string, RankingEntry>();
    for (const r of ranking) m.set(r.empId, r);
    return m;
  }, [ranking]);

  const entryMapRef = useLatestRef(entryMap);
  const lastShownAtRef = useRef(0);

  const onRivalPicked = useCallback(
    (e: Event) => {
      if (!enabled) return;
      if (rankingTypeRef.current !== 'quarter') return;

      const now = Date.now();
      if (now - lastShownAtRef.current < cooldownMs) return;
      lastShownAtRef.current = now;

      const { detail } = e as CustomEvent<RivalPickedDetail>;
      const rivalId = detail?.targetId ?? null;
      const { rivalName, deltaAvg } = calcRivalResult(
        myId,
        rivalId,
        Array.from(entryMapRef.current.values()),
      );

      if (!rivalName) return;

      setRivalName(rivalName);
      setDeltaAvg(deltaAvg);
      setOpen(true);
    },
    [enabled, cooldownMs, rankingTypeRef, entryMapRef, myId],
  );

  useEventListener(
    typeof window !== 'undefined' ? window : undefined,
    EVENT_RIVAL_PICKED,
    onRivalPicked as EventListener,
    { passive: true },
  );

  return {
    open,
    rivalName,
    deltaAvg,
    close: () => setOpen(false),
    openWith: (name: string, d: number | undefined) => {
      setRivalName(name);
      setDeltaAvg(d);
      setOpen(true);
    },
  };
}
