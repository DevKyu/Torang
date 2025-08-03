import {
  CardCenter,
  MonthLabel,
  Score,
  ScoreItem,
  TargetBadge,
} from '../styles/myInfoStyle';
import type { HTMLMotionProps } from 'framer-motion';

type MonthCardProps = {
  month: string;
  score?: number;
  target?: number;
  onEditTarget?: () => void;
} & HTMLMotionProps<'button'>;

const MonthCard = ({
  month,
  score,
  target,
  onEditTarget,
  ...rest
}: MonthCardProps) => (
  <ScoreItem
    {...rest}
    type="button"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.16 }}
  >
    {target !== undefined && (
      <TargetBadge
        onClick={(e) => {
          e.stopPropagation();
          onEditTarget?.();
        }}
      >
        🎯 {target}
      </TargetBadge>
    )}
    <CardCenter>
      <MonthLabel>{month}월</MonthLabel>
      <Score highlight={score !== undefined}>{score ?? '-'}</Score>
    </CardCenter>
  </ScoreItem>
);

export default MonthCard;
