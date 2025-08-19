import type { TwoDigitMonth, YearMonth } from '../types/rival';

export const getYearMonth = (d = new Date()): YearMonth => {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0') as TwoDigitMonth;
  return `${y}${m}`;
};
