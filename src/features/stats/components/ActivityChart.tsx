"use client";

import { useState } from "react";
import type { ActivityStats } from "../types/stats";
import {
  CATEGORY_COLORS,
  Card,
  HoverSparkline,
  MetricRow,
  StatCell,
  StatRow,
} from "./primitives";
import styles from "./primitives/primitives.module.css";

interface ActivityChartProps {
  data: ActivityStats;
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

export function ActivityChart({ data }: ActivityChartProps) {
  const [rangeKey, setRangeKey] = useState<RangeKey>("1m");
  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[1];

  const points = data.dataPoints.slice(-range.days);
  const labels = points.map((p) =>
    new Date(p.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  );

  const total = points.map((p, i) => ({ x: i, y: p.totalActions }));
  const cards = points.map((p, i) => ({ x: i, y: p.cardsCreated }));
  const collections = points.map((p, i) => ({
    x: i,
    y: p.collectionsCreated,
  }));
  const follows = points.map((p, i) => ({ x: i, y: p.followsCreated }));

  const totals = points.reduce(
    (acc, p) => ({
      cardsCreated: acc.cardsCreated + p.cardsCreated,
      collectionsCreated: acc.collectionsCreated + p.collectionsCreated,
      connectionsCreated: acc.connectionsCreated + p.connectionsCreated,
      followsCreated: acc.followsCreated + p.followsCreated,
      totalActions: acc.totalActions + p.totalActions,
    }),
    {
      cardsCreated: 0,
      collectionsCreated: 0,
      connectionsCreated: 0,
      followsCreated: 0,
      totalActions: 0,
    },
  );

  const rows = [
    {
      label: "cards created",
      value: totals.cardsCreated,
      color: CATEGORY_COLORS.cards,
    },
    {
      label: "collections created",
      value: totals.collectionsCreated,
      color: CATEGORY_COLORS.collections,
    },
    {
      label: "connections created",
      value: totals.connectionsCreated,
      color: CATEGORY_COLORS.connections,
    },
    {
      label: "follows created",
      value: totals.followsCreated,
      color: CATEGORY_COLORS.follows,
    },
  ].sort((a, b) => b.value - a.value);
  const maxRow = rows.reduce((m, r) => (r.value > m ? r.value : m), 0);

  return (
    <Card
      title="content activity"
      subtitle={range.subtitle}
      right={<RangeTabs rangeKey={rangeKey} onChange={setRangeKey} />}
    >
      <StatRow>
        <StatCell
          label="total actions"
          value={totals.totalActions.toLocaleString()}
        />
      </StatRow>
      <HoverSparkline
        height={90}
        labels={labels}
        series={[
          { color: CATEGORY_COLORS.accent, points: total },
          { color: CATEGORY_COLORS.cards, points: cards, filled: false },
          {
            color: CATEGORY_COLORS.collections,
            points: collections,
            filled: false,
          },
          { color: CATEGORY_COLORS.follows, points: follows, filled: false },
        ]}
        ariaLabel="Daily content actions"
      />
      <div>
        {rows.map((r) => (
          <MetricRow
            key={r.label}
            color={r.color}
            label={r.label}
            value={r.value.toLocaleString()}
            barFraction={maxRow > 0 ? r.value / maxRow : 0}
          />
        ))}
      </div>
    </Card>
  );
}
