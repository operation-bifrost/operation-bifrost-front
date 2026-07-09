import { line, curveMonotoneX } from "d3-shape";
import { scaleLinear } from "d3-scale";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export function Sparkline({ data, width = 96, height = 28 }: SparklineProps) {
  if (data.length < 2) return <svg width={width} height={height} aria-hidden="true" />;

  const x = scaleLinear()
    .domain([0, data.length - 1])
    .range([1, width - 1]);
  const max = Math.max(...data, 1);
  const y = scaleLinear()
    .domain([0, max])
    .range([height - 2, 2]);

  const path = line<number>()
    .x((_, i) => x(i))
    .y((d) => y(d))
    .curve(curveMonotoneX)(data);

  return (
    <svg width={width} height={height} aria-hidden="true" className="overflow-visible">
      {path && (
        <path
          d={path}
          fill="none"
          stroke="var(--color-nixie-base)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
