import { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
  LabelList,
} from 'recharts';

type MiniTrendChartProps = {
  data: (number | null)[];
  color?: string;
  height?: number;
};

const DotLabelFn = ({ x, y, value }: { x?: number; y?: number; value?: number | null }) =>
  value == null ? null : (
    <text
      x={x}
      y={(y ?? 0) + 16}
      textAnchor="middle"
      fontSize={12}
      fontWeight={600}
      fill="#222"
    >
      {value}
    </text>
  );
const DotLabel = memo(DotLabelFn);
DotLabel.displayName = 'DotLabel';

const MiniTrendChart = ({
  data,
  color = '#16a34a',
  height = 90,
}: MiniTrendChartProps) => {
  const chartData = useMemo(
    () => data.map((v, i) => ({ idx: i, value: v })),
    [data],
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={chartData}
        margin={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
        <Line
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3, fill: color }}
          connectNulls
          type="monotone"
          animationDuration={300}
        >
          <LabelList dataKey="value" content={<DotLabel />} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MiniTrendChart;
