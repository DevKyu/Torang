import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db, auth, empIdFromEmail } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { ActivityItem } from '../types/activity';

export const useActivityDraw = (ym: string) => {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;
    setLoading(true);
    setError(false);

    const authUnsub = onAuthStateChanged(auth, (user) => {
      authUnsub();
      const empId = empIdFromEmail(user?.email);
      if (!empId) {
        setItems([]);
        setLoading(false);
        return;
      }

      unsub = onValue(
        ref(db, `products/${ym}`),
        (snap) => {
          if (cancelled) return;

          if (!snap.exists()) {
            setItems([]);
            setLoading(false);
            return;
          }

          const data = snap.val() as {
            meta?: {
              status?: string;
              winnersReady?: boolean;
              generatedAt?: number;
            };
            items?: Record<string, unknown>[];
          };

          if (data.meta?.status !== 'done' || !data.meta?.winnersReady) {
            setItems([]);
            setLoading(false);
            return;
          }

          const date = data.meta.generatedAt ?? Date.now();
          const result: ActivityItem[] = [];

          for (const item of data.items ?? []) {
            const name = String(item.name ?? '상품');
            const pins =
              typeof item.requiredPins === 'number' ? item.requiredPins : 0;
            const winners: string[] =
              (item.winners as string[] | undefined) ??
              (item.winner as string[] | undefined) ??
              [];
            const raffle: string[] = (item.raffle as string[] | undefined) ?? [];

            if (winners.includes(empId)) {
              result.push({
                id: `draw_${ym}_${item.index}_won`,
                type: 'draw',
                date,
                title: '분기 상품 당첨',
                description: name,
                productName: name,
                won: true,
                requiredPins: pins,
              });
            } else if (raffle.includes(empId) && pins > 0) {
              result.push({
                id: `draw_${ym}_${item.index}_lost`,
                type: 'draw',
                date,
                title: '분기 추첨 결과',
                description: '미당첨',
                productName: name,
                won: false,
                requiredPins: pins,
              });
            }
          }

          setItems(result);
          setLoading(false);
        },
        () => {
          if (cancelled) return;
          setItems([]);
          setLoading(false);
          setError(true);
        },
      );
    });

    return () => {
      cancelled = true;
      authUnsub();
      unsub?.();
    };
  }, [ym]);

  return { items, loading, error };
};
