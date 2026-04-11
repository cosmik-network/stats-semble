"use client";

import { useState } from "react";
import type { GrowthStats } from "../types/stats";
import {
  CATEGORY_COLORS,
  Card,
  HoverSparkline,
  StatCell,
  StatRow,
} from "./primitives";
import styles from "./primitives/primitives.module.css";

interface GrowthChartProps {
  data: GrowthStats;
}

type RangeKey = "7d" | "1m" | "3m";

const RANGES: { key: RangeKey; days: number; label: string; subtitle: string }[] = [
  { key: "7d", days: 7, label: "7d", subtitle: "last 7 days" },
  { key: "1m", days: 30, label: "1m", subtitle: "last 30 days" },
  { key: "3m", days: 90, label: "3m", subtitle: "last 90 days" },
];

export function GrowthChart({ data }: GrowthChartProps) {
  const [rangeKey, setRangeKey] = useState<RangeKey>("1m");
  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[1];
  const points = data.dataPoints.slice(-range.days);

  const labels = points.map((p) =>
    new Date(p.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  );

  const totalSeries = points.map((p, i) => ({ x: i, y: p.totalUsers }));
  const newSeries = points.map((p, i) => ({ x: i, y: p.newUsers }));

  const firstTotal = points[0]?.totalUsers ?? 0;
  const lastTotal = points[points.length - 1]?.totalUsers ?? data.currentTotal;
  const growthDelta = lastTotal - firstTotal;
  const growthPct = firstTotal > 0 ? (growthDelta / firstTotal) * 100 : 0;
  const totalNew = points.reduce((s, p) => s + p.newUsers, 0);

  const rangeTabs = (
    <div className={styles.miniTabs} role="tablist" aria-label="time range">
      {RANGES.map((r) => (
        <button
          key={r.key}
          type="button"
          role="tab"
          aria-selected={rangeKey === r.key}
          onClick={() => setRangeKey(r.key)}
          className={`${styles.miniTab} ${rangeKey === r.key ? styles.miniTabActive : ""}`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <Card title="total users" subtitle={range.subtitle} right={rangeTabs}>
        <StatRow>
          <StatCell
            label="total users"
            value={data.currentTotal.toLocaleString()}
            delta={
              growthDelta >= 0
                ? `+${growthDelta.toLocaleString()} (${growthPct.toFixed(1)}%)`
                : `${growthDelta.toLocaleString()} (${growthPct.toFixed(1)}%)`
            }
          />
        </StatRow>
        <HoverSparkline
          height={80}
          labels={labels}
          series={[
            {
              color: CATEGORY_COLORS.accent,
              points: totalSeries,
            },
          ]}
          ariaLabel={`Total users over the ${range.subtitle}`}
        />
      </Card>
      <Card title="new users" subtitle={range.subtitle} right={rangeTabs}>
        <StatRow>
          <StatCell
            label={`new (${range.label})`}
            value={totalNew.toLocaleString()}
            delta="cumulative"
            dimDelta
          />
        </StatRow>
        <HoverSparkline
          height={80}
          labels={labels}
          series={[
            {
              color: CATEGORY_COLORS.newUsers,
              points: newSeries,
            },
          ]}
          ariaLabel={`New users over the ${range.subtitle}`}
        />
      </Card>
    </>
  );
}
