import { motion } from 'framer-motion';
import { DiffBadge, TrendChartWrapper } from '../styles/myInfoStyle';
import MiniTrendChart from './MiniTrendChart';
import { asMonth } from '../utils/score';
import type { Year, UserScores } from '../types/UserInfo';

type TrendBlockProps = {
  show: boolean;
  avgCur: number;
  avgPrev: number | null;
  diff: number;
  color: string;
  months: readonly string[];
  year: Year;
  scores: UserScores;
};

const TrendBlock = ({
  show,
  avgCur,
  avgPrev,
  diff,
  color,
  months,
  year,
  scores,
}: TrendBlockProps) => {
  if (!show) return null;

  return (
    <motion.div style={{ marginTop: 15 }}>
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
          <strong style={{ color: '#111', fontWeight: 600, marginLeft: 2 }}>
            {avgCur}
          </strong>
          <span style={{ color: '#666', marginLeft: 2 }}> 점</span>
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
