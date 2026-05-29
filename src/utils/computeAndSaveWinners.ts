import { ref, update, serverTimestamp } from 'firebase/database';
import { db, getProductData } from '../services/firebase';
import { getAllUserInfo } from '../utils/user';
import { batchComputeWinners } from '../utils/batchComputeWinners';
import type { ProductItem } from '../types/Product';
import type { UserInfo } from '../types/UserInfo';

export const computeAndSaveWinners = async (ym: string): Promise<void> => {
  const products: ProductItem[] = await getProductData(ym);
  if (!products?.length) throw new Error('등록된 상품이 없어요.');

  const allRaffleIds = Array.from(new Set(products.flatMap((p) => p.raffle ?? [])));
  const userMap: Record<string, UserInfo> = await getAllUserInfo(allRaffleIds);

  const sortedProducts = [...products].sort(
    (a, b) => b.requiredPins - a.requiredPins || Number(a.index) - Number(b.index),
  );
  const { winnersPerProduct, supplementPerProduct } = batchComputeWinners(sortedProducts, userMap);

  const updates: Record<string, any> = {};
  for (const [index, winners] of Object.entries(winnersPerProduct)) {
    updates[`products/${ym}/items/${index}/winners`] = winners;
  }
  updates[`products/${ym}/meta`] = {
    status: 'done',
    winnersReady: true,
    supplement: supplementPerProduct,
    drawOrder: sortedProducts.map((p) => p.index),
    generatedAt: serverTimestamp(),
  };

  await update(ref(db), updates);
};
