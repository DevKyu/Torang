import {
  ref,
  runTransaction,
  update,
  serverTimestamp,
  get,
} from 'firebase/database';
import { toast } from 'sonner';
import { db, getProductData } from '../services/firebase';
import { getAllUserInfo } from '../utils/user';
import { batchComputeWinners } from '../utils/batchComputeWinners';

import type { NavigateOptions } from 'react-router-dom';
import type { ProductItem } from '../types/Product';
import type { UserInfo } from '../types/UserInfo';

const waitForWinners = async (
  metaRef: ReturnType<typeof ref>,
  interval = 2000,
  maxTries = 10,
) => {
  for (let i = 0; i < maxTries; i++) {
    const snap = await get(metaRef);
    const data = snap.val();
    if (data?.winnersReady && data?.status === 'done') return data;
    if (data?.status === 'error') throw new Error('Winner calculation failed');
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error('Timeout: winners not ready');
};

export const ensureBatchWinners = async (
  yyyymm: string,
  navigateFn: (path: string, opts?: NavigateOptions) => void,
): Promise<void> => {
  const metaRef = ref(db, `products/${yyyymm}/meta`);

  const tx = await runTransaction(metaRef, (current) => {
    if (current?.winnersReady) return current;
    if (current?.status === 'processing') return current;
    return {
      winnersReady: false,
      status: 'processing',
      startedAt: serverTimestamp(),
    };
  });

  if (!tx.committed) {
    try {
      await waitForWinners(metaRef);
    } catch {
      toast.error('당첨자 계산에 실패했어요!');
      setTimeout(() => navigateFn('/menu', { replace: true }), 2000);
    }
    return;
  }

  const meta = tx.snapshot.val();
  if (meta?.winnersReady || meta?.status !== 'processing') return;

  try {
    const products: ProductItem[] = await getProductData(yyyymm);
    const allRaffleIds = Array.from(
      new Set(products.flatMap((p) => p.raffle ?? [])),
    );
    const userMap: Record<string, UserInfo> =
      await getAllUserInfo(allRaffleIds);

    const { winnersPerProduct, supplementPerProduct } = batchComputeWinners(
      products,
      userMap,
    );

    const updates: Record<string, any> = {};
    for (const [index, winners] of Object.entries(winnersPerProduct)) {
      updates[`products/${yyyymm}/items/${index}/winners`] = winners;
    }
    updates[`products/${yyyymm}/meta`] = {
      status: 'done',
      winnersReady: true,
      supplement: supplementPerProduct,
      drawOrder: [...products]
        .sort(
          (a, b) =>
            b.requiredPins - a.requiredPins ||
            Number(a.index) - Number(b.index),
        )
        .map((p) => p.index),
      generatedAt: serverTimestamp(),
    };

    await update(ref(db), updates);
  } catch (err) {
    await update(metaRef, {
      status: 'error',
      winnersReady: false,
      failedAt: serverTimestamp(),
    });
    toast.error('당첨자 계산 중 오류가 발생했어요!');
    throw err;
  }
};
