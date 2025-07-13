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

const DotLabel = ({ x, y, value }: any) =>
  value == null ? null : (
    <text
      x={x}
      y={y + 16}
      textAnchor="middle"
      fontSize={12}
      fontWeight={600}
      fill="#222"
    >
      {value}
    </text>
  );

const MiniTrendChart = ({
  data,
  color = '#16a34a',
  height = 90,
}: MiniTrendChartProps) => {
  const chartData = data.map((v, i) => ({ idx: i, value: v }));

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
