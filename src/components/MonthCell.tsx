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
};

const MonthCell = ({ meta, overallAvg, onSave }: MonthCellProps) => {
  const { month, key, score, target, edit } = meta;

  if (target !== undefined) {
    return (
      <ScoreDialog
        monthLabel={`${month}월 목표`}
        defaultValue={target}
        minScore={overallAvg ?? 50}
        onSave={(val) => onSave(val, key)}
        trigger={(open) => (
          <MonthCard
            month={month}
            score={score}
            target={target}
            onEditTarget={open}
          />
        )}
      />
    );
  }

  if (edit) {
    return (
      <ScoreDialog
        monthLabel={`${month}월 목표`}
        defaultValue={score}
        minScore={overallAvg ?? 50}
        onSave={(val) => onSave(val, key)}
      >
        <MonthCard month={month} score={score} />
      </ScoreDialog>
    );
  }

  return <MonthCard month={month} score={score} target={target} />;
};

export default MonthCell;
