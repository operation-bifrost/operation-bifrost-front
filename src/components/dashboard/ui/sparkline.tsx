import { Line, LineChart } from "recharts";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

/**
 * Tiny trend line for KPI tiles. Fixed width/height (no ResponsiveContainer)
 * so it renders deterministically in tests and adds no layout measurement.
 */
export function Sparkline({ data, width = 96, height = 28 }: SparklineProps) {
  if (data.length < 2) return <svg width={width} height={height} aria-hidden="true" />;
  const points = data.map((value, index) => ({ index, value }));
  return (
    <LineChart
      width={width}
      height={height}
      data={points}
      margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
    >
      <Line
        type="monotone"
        dataKey="value"
        stroke="var(--chart-1)"
        strokeWidth={1.5}
        dot={false}
        isAnimationActive={false}
      />
    </LineChart>
  );
}
