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
  locked?: boolean;
  activityGlow?: boolean;
} & HTMLMotionProps<'button'>;

const MonthCard = ({
  month,
  score,
  target,
  onEditTarget,
  locked = false,
  activityGlow = false,
  ...rest
}: MonthCardProps) => (
  <ScoreItem
    {...rest}
    type="button"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.16 }}
    $locked={locked}
    $activityGlow={activityGlow}
  >
    {target !== undefined && (
      <TargetBadge
        locked={locked}
        title={locked ? '목표 수정 마감' : undefined}
        onClick={(e) => {
          if (locked) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
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
