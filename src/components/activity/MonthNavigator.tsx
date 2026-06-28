import { type TouchEvent, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  HeaderRow,
  MonthNavButton,
  MonthText,
} from '../../styles/activity/MonthNavigatorStyle';

type Props = {
  ym: string;
  minYm?: string;
  maxYm?: string;
  onChange: (ym: string) => void;
};

const MonthNavigator = ({ ym, minYm, maxYm, onChange }: Props) => {
  const year = Number(ym.slice(0, 4));
  const month = Number(ym.slice(4, 6));

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

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(diff) < 40) return;
      moveMonth(diff < 0 ? 1 : -1);
    },
    [moveMonth],
  );

  return (
    <HeaderRow
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { touchStartX.current = null; }}
    >
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
