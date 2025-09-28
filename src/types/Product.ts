export type ProductItem = {
  index: number;
  name: string;
  requiredPins: number;
  raffle?: string[];
  winners?: string[];
  winnersCount?: number;
};

export type ProductBundle = {
  items: ProductItem[];
  meta: {
    winnersReady?: boolean;
    status?: string;
    drawOrder?: number[];
    generatedAt?: number;
    supplement?: Record<number, string[]>;
  };
};
