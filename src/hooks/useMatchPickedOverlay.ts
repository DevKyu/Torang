import { useCallback, useRef, useState } from 'react';
import { useEventListener } from './useEventListener';
import { useLatestRef } from './useLatestRef';
import {
  EVENT_MATCH_PICKED,
  type MatchPickedDetail,
} from '../constants/events';
import type { RankingEntry, RankingType } from '../types/Ranking';
import { calcRankingResult } from '../utils/matchResult';

type Params = {
  rankingType: RankingType;
  ranking: RankingEntry[];
  myId: string | null;
  enabled?: boolean;
  cooldownMs?: number;
};

export function useMatchPickedOverlay({
  rankingType,
  ranking,
  myId,
  enabled = true,
  cooldownMs = 1000,
}: Params) {
  const [open, setOpen] = useState(false);
  const [opponentName, setOpponentName] = useState('');
  const [deltaAvg, setDeltaAvg] = useState<number>();

  const rankingTypeRef = useLatestRef(rankingType);
  const lastShownAtRef = useRef(0);

  const onPicked = useCallback(
    (e: Event) => {
      if (!enabled || rankingTypeRef.current !== 'monthly') return;

      const now = Date.now();
      if (now - lastShownAtRef.current < cooldownMs) return;
      lastShownAtRef.current = now;

      const { detail } = e as CustomEvent<MatchPickedDetail>;
      const { name, deltaAvg } = calcRankingResult(
        myId,
        detail?.targetId,
        ranking,
      );

      if (!name) return;
      setOpponentName(name);
      setDeltaAvg(deltaAvg);
      setOpen(true);
    },
    [enabled, cooldownMs, rankingTypeRef, myId, ranking],
  );

  useEventListener(window, EVENT_MATCH_PICKED, onPicked as EventListener, {
    passive: true,
  });

  return {
    open,
    opponentName,
    deltaAvg,
    close: () => setOpen(false),
  };
}
