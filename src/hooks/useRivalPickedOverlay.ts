import { useCallback, useMemo, useRef, useState } from 'react';
import { useEventListener } from './useEventListener';
import { useLatestRef } from './useLatestRef';
import {
  EVENT_RIVAL_PICKED,
  type RivalPickedDetail,
} from '../constants/events';
import type { RankingEntry, RankingType } from '../types/Ranking';

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

  const meEntryRef = useLatestRef(myId ? (entryMap.get(myId) ?? null) : null);

  const onRivalPicked = useCallback(
    (e: Event) => {
      if (!enabled) return;
      if (rankingTypeRef.current !== 'quarter') return;

      const now = Date.now();
      if (now - lastShownAtRef.current < cooldownMs) return;
      lastShownAtRef.current = now;

      const { detail } = e as CustomEvent<RivalPickedDetail>;
      const rival = detail?.targetId
        ? entryMapRef.current.get(detail.targetId)
        : undefined;
      const meEntry = meEntryRef.current;

      if (!meEntry || !rival) return;

      const d = Number((meEntry.average - rival.average).toFixed(1));
      setRivalName(detail?.targetName ?? '');
      setDeltaAvg(d);
      setOpen(true);
    },
    [enabled, cooldownMs, rankingTypeRef, entryMapRef, meEntryRef],
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
