export type Product = {
  name: string;
  requiredPins: number;
  category: '생활' | '굿즈';
};

export const products: Product[] = [
  { name: '무릎담요', requiredPins: 3, category: '생활' },
  { name: '텀블러', requiredPins: 2, category: '생활' },
  { name: '카카오 굿즈', requiredPins: 5, category: '굿즈' },
  { name: '볼링 장갑', requiredPins: 4, category: '굿즈' },
];

export const categories: ('전체' | '생활' | '굿즈')[] = [
  '전체',
  '생활',
  '굿즈',
];
