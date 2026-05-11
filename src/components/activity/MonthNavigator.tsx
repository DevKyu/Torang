import { useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  HeaderRow,
  MonthNavButton,
  MonthText,
} from '../../styles/MonthNavigatorStyle';

type Props = {
  yyyymm: string;
  minYm?: string;
  maxYm?: string;
  onChange: (ym: string) => void;
};

const MonthNavigator = ({ yyyymm, minYm, maxYm, onChange }: Props) => {
  const year = Number(yyyymm.slice(0, 4));
  const month = Number(yyyymm.slice(4, 6));

  const minYear = minYm ? Number(minYm.slice(0, 4)) : undefined;
  const minMonth = minYm ? Number(minYm.slice(4, 6)) : undefined;

  const maxYear = maxYm ? Number(maxYm.slice(0, 4)) : undefined;
  const maxMonth = maxYm ? Number(maxYm.slice(4, 6)) : undefined;

  const isPrevDisabled =
    minYear !== undefined &&
    (year < minYear || (year === minYear && month <= (minMonth ?? 1)));

  const isNextDisabled =
    maxYear !== undefined &&
    (year > maxYear || (year === maxYear && month >= (maxMonth ?? 12)));

  const moveMonth = useCallback(
    (dir: -1 | 1) => {
      let y = year;
      let m = month + dir;

      if (m <= 0) {
        y -= 1;
        m = 12;
      } else if (m > 12) {
        y += 1;
        m = 1;
      }

      if (
        minYear !== undefined &&
        (y < minYear || (y === minYear && m < (minMonth ?? 1)))
      ) {
        return;
      }

      if (
        maxYear !== undefined &&
        (y > maxYear || (y === maxYear && m > (maxMonth ?? 12)))
      ) {
        return;
      }

      onChange(`${y}${String(m).padStart(2, '0')}`);
    },
    [year, month, minYear, minMonth, maxYear, maxMonth, onChange],
  );

  return (
    <HeaderRow>
      <MonthNavButton disabled={isPrevDisabled} onClick={() => moveMonth(-1)}>
        <ChevronLeft size={15} />
      </MonthNavButton>

      <MonthText>
        {year}년 {month}월
      </MonthText>

      <MonthNavButton disabled={isNextDisabled} onClick={() => moveMonth(1)}>
        <ChevronRight size={15} />
      </MonthNavButton>
    </HeaderRow>
  );
};

export default MonthNavigator;
