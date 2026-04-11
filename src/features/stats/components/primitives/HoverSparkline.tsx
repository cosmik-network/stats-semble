"use client";

import { useCallback, useRef, useState } from "react";
import styles from "./primitives.module.css";
import {
  computeGeometry,
  linePoints,
  niceTicks,
  polygonPoints,
  projectPoints,
  seriesMax,
  type SparkSeries,
} from "./sparkline-shared";

function pickAxisTicks(n: number, target = 5): number[] {
  if (n <= 0) return [];
  if (n === 1) return [0];
  const count = Math.min(n, target);
  if (count === 1) return [0];
  const ticks: number[] = [];
  for (let i = 0; i < count; i++) {
    ticks.push(Math.round((i / (count - 1)) * (n - 1)));
  }
  return Array.from(new Set(ticks));
}

interface HoverSparklineProps {
  series: SparkSeries[];
  labels: string[];
  height?: number;
  width?: number;
  ariaLabel?: string;
  formatValue?: (y: number) => string;
}

export function HoverSparkline({
  series,
  labels,
  height = 80,
  width = 600,
  ariaLabel,
  formatValue = (y) => y.toLocaleString(),
}: HoverSparklineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{
    idx: number;
    x: number;
  } | null>(null);

  const geom = computeGeometry(width, height);
  const rawMax = seriesMax(series);
  const { ticks, niceMax } = niceTicks(rawMax);
  const max = niceMax;
  const n = Math.max(...series.map((s) => s.points.length), 0);

  const handleMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (n === 0) return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const relX = ((e.clientX - rect.left) / rect.width) * width;
      const frac = (relX - geom.padding.left) / geom.chartW;
      const idx = Math.round(frac * (n - 1));
      const clamped = Math.max(0, Math.min(n - 1, idx));
      setHover({ idx: clamped, x: (e.clientX - rect.left) / rect.width });
    },
    [geom.chartW, geom.padding.left, n, width],
  );

  const handleLeave = useCallback(() => setHover(null), []);

  const tooltipLabel =
    hover !== null && labels[hover.idx] !== undefined ? labels[hover.idx] : "";
  const tooltipValues =
    hover !== null
      ? series
          .filter((s) => s.points[hover.idx] !== undefined)
          .map((s) => ({
            color: s.color,
            text: formatValue(s.points[hover.idx].y),
          }))
      : [];

  return (
    <div className={styles.sparkWrap} ref={wrapRef}>
      <div
        className={styles.yAxis}
        aria-hidden="true"
        style={{ height }}
      >
        {[...ticks].reverse().map((t, i) => (
          <span key={i}>{formatValue(t)}</span>
        ))}
      </div>
      <div className={styles.sparkBody}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        role="img"
        aria-label={ariaLabel}
        style={{ cursor: "crosshair", height }}
      >
        {series.map((s, si) => {
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
        {hover && max > 0 && (
          <>
            <line
              x1={geom.padding.left + hover.x * geom.chartW}
              x2={geom.padding.left + hover.x * geom.chartW}
              y1={geom.padding.top}
              y2={geom.padding.top + geom.chartH}
              stroke="var(--border-2)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            {series.map((s, si) => {
              const pt = s.points[hover.idx];
              if (!pt) return null;
              const projected = projectPoints(s.points, geom, max);
              const p = projected[hover.idx];
              return (
                <circle
                  key={si}
                  cx={p.x}
                  cy={p.y}
                  r={2.5}
                  fill={s.color}
                  stroke="var(--bg)"
                  strokeWidth={1}
                />
              );
            })}
          </>
        )}
      </svg>
        {labels.length > 0 && (
          <div className={styles.xAxis} aria-hidden="true">
            {pickAxisTicks(labels.length).map((i) => (
              <span
                key={i}
                style={{ left: `${(i / Math.max(labels.length - 1, 1)) * 100}%` }}
              >
                {labels[i]}
              </span>
            ))}
          </div>
        )}
        <div
          className={styles.tooltip}
          style={{
            opacity: hover ? 1 : 0,
            left: hover ? `${hover.x * 100}%` : 0,
            transform: "translateX(-50%)",
          }}
        >
          {tooltipLabel}
          {tooltipValues.map((v, i) => (
            <span key={i}>
              {" · "}
              <span style={{ color: v.color }}>{v.text}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
