"use client";

import { useState } from "react";
import type { GrowthStats, GrowthDataPoint } from "../types/stats";
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

interface RangeDef {
  key: RangeKey;
  days: number;
  label: string;
  subtitle: string;
}

const RANGES: RangeDef[] = [
  { key: "7d", days: 7, label: "7d", subtitle: "last 7 days" },
  { key: "1m", days: 30, label: "1m", subtitle: "last 30 days" },
  { key: "3m", days: 90, label: "3m", subtitle: "last 90 days" },
];

function RangeTabs({
  rangeKey,
  onChange,
}: {
  rangeKey: RangeKey;
  onChange: (k: RangeKey) => void;
}) {
  return (
    <div className={styles.miniTabs} role="tablist" aria-label="time range">
      {RANGES.map((r) => (
        <button
          key={r.key}
          type="button"
          role="tab"
          aria-selected={rangeKey === r.key}
          onClick={() => onChange(r.key)}
          className={`${styles.miniTab} ${rangeKey === r.key ? styles.miniTabActive : ""}`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function useRange(initial: RangeKey = "1m") {
  const [rangeKey, setRangeKey] = useState<RangeKey>(initial);
  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[1];
  return { rangeKey, setRangeKey, range };
}

function sliceLabels(points: GrowthDataPoint[]): string[] {
  return points.map((p) =>
    new Date(p.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  );
}

function TotalUsersCard({ data }: { data: GrowthStats }) {
  const { rangeKey, setRangeKey, range } = useRange();
  const points = data.dataPoints.slice(-range.days);
  const labels = sliceLabels(points);
  const totalSeries = points.map((p, i) => ({ x: i, y: p.totalUsers }));

  const firstTotal = points[0]?.totalUsers ?? 0;
  const lastTotal = points[points.length - 1]?.totalUsers ?? data.currentTotal;
  const growthDelta = lastTotal - firstTotal;
  const growthPct = firstTotal > 0 ? (growthDelta / firstTotal) * 100 : 0;

  return (
    <Card
      title="total users"
      subtitle={range.subtitle}
      right={<RangeTabs rangeKey={rangeKey} onChange={setRangeKey} />}
    >
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
  );
}

function NewUsersCard({ data }: { data: GrowthStats }) {
  const { rangeKey, setRangeKey, range } = useRange();
  const points = data.dataPoints.slice(-range.days);
  const labels = sliceLabels(points);
  const newSeries = points.map((p, i) => ({ x: i, y: p.newUsers }));
  const totalNew = points.reduce((s, p) => s + p.newUsers, 0);

  return (
    <Card
      title="new users"
      subtitle={range.subtitle}
      right={<RangeTabs rangeKey={rangeKey} onChange={setRangeKey} />}
    >
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
  );
}

export function GrowthChart({ data }: GrowthChartProps) {
  return (
    <>
      <TotalUsersCard data={data} />
      <NewUsersCard data={data} />
    </>
  );
}
