"use client";

import { useMemo, useState } from "react";
import {
  Card,
  StatCell,
  StatRow,
  HoverSparkline,
} from "@/features/stats/components/primitives";
import type { WacStatsDTO, WacDataPoint } from "../types";
import {
  PA_COLORS,
  RANGE_OPTIONS,
  computeDelta,
  formatDelta,
  formatWeekRange,
  formatWeekShort,
} from "../lib/shared";
import { WeekNav } from "./WeekNav";
import { RangeTabs } from "./RangeTabs";

interface Props {
  data: WacStatsDTO;
}

interface MetricDef {
  key: keyof Omit<WacDataPoint, "weekStart">;
  label: string;
  color: string;
}

const METRICS: MetricDef[] = [
  {
    key: "collectionOrConnection",
    label: "WAC · collection or connection",
    color: PA_COLORS.collectionOrConnection,
  },
  {
    key: "collectionAdd",
    label: "added to a collection",
    color: PA_COLORS.collectionAdd,
  },
  {
    key: "connection",
    label: "created a connection",
    color: PA_COLORS.connection,
  },
  {
    key: "othersCollectionAdd",
    label: "added to someone else's collection",
    color: PA_COLORS.othersCollectionAdd,
  },
];

function deltaNode(now: number, prev: number | undefined) {
  const d = computeDelta(now, prev);
  if (prev === undefined) return undefined;
  const color =
    d.dir === "up"
      ? "var(--accent)"
      : d.dir === "down"
        ? "#ef5b6b"
        : "var(--text-dim)";
  return (
    <span style={{ color }}>
      {formatDelta(d)}{" "}
      <span style={{ color: "var(--text-dim)" }}>
        vs {prev.toLocaleString()}
      </span>
    </span>
  );
}

export function WacSection({ data }: Props) {
  const points = data.dataPoints;
  const n = points.length;

  // Headline week index: default to most recent week.
  const [idx, setIdx] = useState(n - 1);
  const [rangeKey, setRangeKey] = useState("52w");

  const current = points[idx];
  const prior = idx > 0 ? points[idx - 1] : undefined;

  const range =
    RANGE_OPTIONS.find((r) => r.key === rangeKey) ?? RANGE_OPTIONS[2];
  const sliced = useMemo(
    () => (range.weeks > 0 ? points.slice(-range.weeks) : points),
    [points, range.weeks],
  );

  const labels = sliced.map((p) => formatWeekShort(p.weekStart));
  const series = [
    {
      color: PA_COLORS.wac,
      points: sliced.map((p, i) => ({ x: i, y: p.collectionOrConnection })),
    },
  ];

  if (n === 0 || !current) {
    return (
      <Card title="weekly active curators">
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>no data</div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title="weekly active curators"
        subtitle={`week of ${formatWeekRange(current.weekStart)} · vs prior week`}
        right={
          <WeekNav
            label={formatWeekShort(current.weekStart)}
            onPrev={() => setIdx((i) => Math.max(0, i - 1))}
            onNext={() => setIdx((i) => Math.min(n - 1, i + 1))}
            canPrev={idx > 0}
            canNext={idx < n - 1}
          />
        }
      >
        <StatRow>
          {METRICS.map((m) => (
            <StatCell
              key={m.key}
              label={m.label}
              value={current[m.key].toLocaleString()}
              delta={deltaNode(current[m.key], prior?.[m.key])}
              dimDelta={prior === undefined}
            />
          ))}
        </StatRow>
      </Card>

      <Card
        title="all-time weekly active curators"
        subtitle="distinct curators per week"
        right={<RangeTabs value={rangeKey} onChange={setRangeKey} />}
      >
        <HoverSparkline
          height={200}
          labels={labels}
          series={series}
          ariaLabel="Weekly active curators over time"
        />
      </Card>
    </>
  );
}
