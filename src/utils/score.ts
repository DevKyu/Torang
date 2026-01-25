import type { Month, UserScores, Year } from '../types/UserInfo';

export const quarters = {
  '1분기': ['1', '2', '3'],
  '2분기': ['4', '5', '6'],
  '3분기': ['7', '8', '9'],
  '4분기': ['10', '11', '12'],
} as const;
export type Quarter = keyof typeof quarters;

export const quarterList = Object.keys(quarters) as Quarter[];

export const monthToQuarter = (m: number): Quarter => {
  if (m <= 3) return '1분기';
  if (m <= 6) return '2분기';
  if (m <= 9) return '3분기';
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

export const getRecent3Scores = (scores: UserScores): number[] => {
  const entries: Array<{ y: Year; m: Month; ym: number }> = [];

  for (const y of Object.keys(scores)) {
    const year = asYear(y);
    for (const m of Object.keys(scores[year] ?? {})) {
      const monthNum = Number(m);
      const score = scores[year]?.[m as Month];

      if (Number.isFinite(score)) {
        entries.push({
          y: year,
          m: String(monthNum) as Month,
          ym: Number(`${y}${String(monthNum).padStart(2, '0')}`),
        });
      }
    }
  }

  return entries
    .sort((a, b) => b.ym - a.ym)
    .slice(0, 3)
    .map(({ y, m }) => scores[y]?.[m])
    .filter((v): v is number => typeof v === 'number');
};

export const asYear = <T extends string>(v: T | Year): Year => v as Year;
export const asMonth = <T extends string>(v: T | Month): Month => v as Month;

export const normalizeMonth = (m: string | number): Month | null => {
  const n = Number(m);
  if (!Number.isInteger(n) || n < 1 || n > 12) {
    return null;
  }
  return String(n) as Month;
};
