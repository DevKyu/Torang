export type MatchType = 'rival' | 'pin';

export type TwoDigitMonth =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12';

export type YearMonth = `${number}${TwoDigitMonth}`;
