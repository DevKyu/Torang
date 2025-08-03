import type { Year } from '../types/UserInfo';

export const TODAY = new Date();
export const THIS_YEAR: Year = String(TODAY.getFullYear()) as Year;
export const CUR_YEAR: Year = String(TODAY.getFullYear()) as Year;
export const CUR_MONTHN = TODAY.getMonth() + 1;
