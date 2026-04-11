import styles from "./primitives.module.css";
import {
  computeGeometry,
  linePoints,
  polygonPoints,
  projectPoints,
  seriesMax,
  type SparkSeries,
} from "./sparkline-shared";

interface SparklineProps {
  series: SparkSeries[];
  height?: number;
  width?: number;
  ariaLabel?: string;
  sharedScale?: boolean;
}

export function Sparkline({
  series,
  height = 60,
  width = 600,
  ariaLabel,
  sharedScale = true,
}: SparklineProps) {
  const geom = computeGeometry(width, height);
  const globalMax = sharedScale ? seriesMax(series) : 0;

  return (
    <div className={styles.sparkWrap}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
      >
        {series.map((s, si) => {
          const max = sharedScale
            ? globalMax
            : s.points.reduce((m, p) => (p.y > m ? p.y : m), 0);
          if (max <= 0 || s.points.length === 0) return null;
          const projected = projectPoints(s.points, geom, max);
          const stroke = s.strokeWidth ?? 1.5;
          return (
            <g key={si}>
              {s.filled !== false && (
                <polygon
                  points={polygonPoints(projected, geom)}
                  fill={s.color}
                  opacity={0.15}
                />
              )}
              <polyline
                points={linePoints(projected)}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
