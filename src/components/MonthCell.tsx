import React from 'react';
import ScoreDialog from './ScoreDialog';
import MonthCard from './MonthCard';
import type { Month } from '../types/UserInfo';

type MonthCellProps = {
  meta: {
    month: string;
    key: Month;
    score?: number;
    target?: number;
    edit: boolean;
  };
  overallAvg: number | null;
  onSave: (val: number, key: Month) => void;
  timeAllowed: boolean;
  highlightActivity?: boolean;
};

const MonthCell = ({
  meta,
  overallAvg,
  onSave,
  timeAllowed,
  highlightActivity = false,
}: MonthCellProps) => {
  const { month, key, score, target, edit } = meta;
  const canEdit = timeAllowed && (target !== undefined || edit);
  const defaultValue = target ?? score ?? overallAvg ?? 150;

  return (
    <ScoreDialog
      monthLabel={`${month}월`}
      defaultValue={defaultValue}
      minScore={overallAvg ?? 50}
      onSave={(val) => onSave(val, key)}
      trigger={(open) => (
        <MonthCard
          month={month}
          score={score}
          target={target}
          locked={!canEdit}
          onClick={canEdit ? open : undefined}
          onEditTarget={canEdit ? open : undefined}
          activityGlow={highlightActivity}
        />
      )}
    />
  );
};

export default React.memo(MonthCell);
