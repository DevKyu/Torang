import { motion } from 'framer-motion';
import { DiffBadge, TrendChartWrapper } from '../../styles/pages/myInfoStyle';
import MiniTrendChart from './MiniTrendChart';
import { asMonth } from '../../utils/score';
import type { Year, UserScores } from '../../types/UserInfo';

type TrendBlockProps = {
  avgCur: number;
  avgPrev: number | null;
  diff: number;
  color: string;
  months: readonly string[];
  year: Year;
  scores: UserScores;
};

const TrendBlock = ({
  avgCur,
  avgPrev,
  diff,
  color,
  months,
  year,
  scores,
}: TrendBlockProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 'auto', marginTop: 15 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      style={{ overflow: 'hidden' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <div style={{ fontSize: 13 }}>
          <span style={{ color: '#666' }}>분기 평균 </span>
          <strong style={{ color: '#111', fontWeight: 600 }}>{avgCur}</strong>
          <span style={{ color: '#666' }}> 점</span>
        </div>

        {avgPrev !== null && (
          <DiffBadge color={color}>
            {diff > 0 ? '▲' : diff < 0 ? '▼' : '―'}&nbsp;{Math.abs(diff)}
          </DiffBadge>
        )}
      </div>

      <TrendChartWrapper>
        <MiniTrendChart
          data={months.map((m) => scores[year]?.[asMonth(m)] ?? null)}
          color={color}
        />
      </TrendChartWrapper>
    </motion.div>
  );
};

export default TrendBlock;
