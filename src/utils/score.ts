import type { Month, Year } from '../types/UserInfo';

export const quarters = {
  '1분기': ['1', '2', '3'],
  '2분기': ['4', '5', '6'],
  '3분기': ['7', '8', '9'],
  '4분기': ['10', '11', '12'],
} as const;
export type Quarter = keyof typeof quarters;

export const quarterList = Object.keys(quarters) as Quarter[];

export const monthToQuarter = (m: number): Quarter => {
  if (m <= 2) return '1분기';
  if (m <= 5) return '2분기';
  if (m <= 8) return '3분기';
  return '4분기';
};

export const calcAvg = (vals: (number | undefined)[]): number | null => {
  const nums = vals.filter((v): v is number => v !== undefined);
  return nums.length
    ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
    : null;
};

export const calcOverallAvg = (
  scores: Record<string, Record<string, number> | undefined>,
): number | null => {
  const vals = Object.values(scores).flatMap((monthly) =>
    monthly ? Object.values(monthly) : [],
  );
  return vals.length
    ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
    : null;
};

export const getPrevQuarter = (
  y: string,
  q: Quarter,
): [string, Quarter] | null => {
  const idx = quarterList.indexOf(q);
  return idx === 0
    ? [String(Number(y) - 1), '4분기']
    : [y, quarterList[idx - 1]];
};

export const asYear = <T extends string>(v: T | Year): Year => v as Year;
export const asMonth = <T extends string>(v: T | Month): Month => v as Month;
