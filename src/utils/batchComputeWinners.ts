import type { ProductItem } from '../types/Product';
import type { UserInfo } from '../types/UserInfo';

type LosersMap = Record<number, { ids: string[]; requiredPins: number }>;

function weightedPick(
  candidates: string[],
  userMap: Record<string, UserInfo>,
  globalWinners: Set<string>,
  count: number,
  requiredPins: number,
  isPostFill: boolean,
  losersPerProduct: LosersMap,
): string[] {
  const winners: string[] = [];

  for (let i = 0; i < count && candidates.length > 0; i++) {
    const weights = candidates.map((id) => {
      let weight = 1;
      const user = userMap[id];
      if (!user) return { id, weight: 0 };

      if (user.type === 'Member') weight *= 1.5;
      if (globalWinners.has(id)) weight *= 0.7;

      if (isPostFill) {
        const highPinFails = Object.values(losersPerProduct)
          .filter((entry) => entry.ids.includes(id))
          .filter((entry) => entry.requiredPins > requiredPins).length;

        if (highPinFails > 0) {
          const bonus = 1 + 0.25 * highPinFails;
          weight *= Math.min(bonus, 2.0);
        }
      }
      return { id, weight };
    });

    const total = weights.reduce((sum, w) => sum + w.weight, 0);
    if (total <= 0) break;

    let r = Math.random() * total;
    let chosen: string | null = null;

    for (const w of weights) {
      r -= w.weight;
      if (r <= 0) {
        chosen = w.id;
        break;
      }
    }

    if (chosen) {
      winners.push(chosen);
      globalWinners.add(chosen);
      candidates = candidates.filter((id) => id !== chosen);
    }
  }

  return winners;
}

export function batchComputeWinners(
  products: ProductItem[],
  userMap: Record<string, UserInfo>,
): {
  winnersPerProduct: Record<number, string[]>;
  supplementPerProduct: Record<number, string[]>;
} {
  const winnersPerProduct: Record<number, string[]> = {};
  const supplementPerProduct: Record<number, string[]> = {};
  const losersPerProduct: LosersMap = {};
  const globalWinners = new Set<string>();

  for (const product of products) {
    const productIndex = Number(product.index);
    const raffle = [...(product.raffle ?? [])];
    const winnersCount = product.winnersCount ?? 1;

    if (raffle.length === 0 && product.requiredPins > 0) {
      winnersPerProduct[productIndex] = [];
      continue;
    }

    const winners = weightedPick(
      raffle,
      userMap,
      globalWinners,
      winnersCount,
      product.requiredPins,
      false,
      losersPerProduct,
    );

    winnersPerProduct[productIndex] = winners;
    losersPerProduct[productIndex] = {
      ids: raffle.filter((id) => !winners.includes(id)),
      requiredPins: product.requiredPins,
    };
  }

  for (const product of products) {
    const index = Number(product.index);
    const raffle = product.raffle ?? [];
    if (raffle.length === 0 && product.requiredPins > 0) continue;

    const winners = winnersPerProduct[index] ?? [];
    const requiredPins = product.requiredPins;
    const slots = (product.winnersCount ?? 1) - winners.length;

    if (slots <= 0) continue;

    const pool = Object.keys(userMap).filter(
      (id) => !winners.includes(id) && !globalWinners.has(id),
    );
    if (pool.length === 0) continue;

    const extra = weightedPick(
      pool,
      userMap,
      globalWinners,
      slots,
      requiredPins,
      true,
      losersPerProduct,
    );

    winnersPerProduct[index] = [...winners, ...extra];
    supplementPerProduct[index] = extra;
  }

  return { winnersPerProduct, supplementPerProduct };
}
