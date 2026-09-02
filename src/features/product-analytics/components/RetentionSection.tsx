"use client";

import { useMemo, useState } from "react";
import {
  Card,
  StatCell,
  StatRow,
  HoverSparkline,
} from "@/features/stats/components/primitives";
import styles from "@/features/stats/components/primitives/primitives.module.css";
import type { RetentionStatsDTO, RetentionDataPoint } from "../types";
import {
  PA_COLORS,
  RANGE_OPTIONS,
  computeDelta,
  formatDelta,
  formatWeekShort,
} from "../lib/shared";
import {
  cohortRate,
  pooledRate,
  rollingAverage,
  type RetentionMetric,
} from "../lib/retention";
import { RangeTabs } from "./RangeTabs";
import { ModeTabs } from "./ModeTabs";

interface Props {
  data: RetentionStatsDTO;
}

const METRIC_OPTIONS = [
  { key: "activeUsers", label: "active" },
  { key: "curatingUsers", label: "curating" },
];

const METRIC_COLORS: Record<RetentionMetric, string> = {
  activeUsers: PA_COLORS.retentionActive,
  curatingUsers: PA_COLORS.retentionCurating,
};

const HEADLINE_OFFSETS = [1, 4, 8];
const HEADLINE_WINDOW = 4; // pooled cohorts per headline figure
const MAX_TRIANGLE_OFFSETS = 12;

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

function HeadlineCard({
  data,
  metric,
  onMetricChange,
}: {
  data: RetentionStatsDTO;
  metric: RetentionMetric;
  onMetricChange: (m: RetentionMetric) => void;
}) {
  const cohorts = data.dataPoints;

  return (
    <Card
      title="retention"
      subtitle={`% of signup cohort still ${metric === "activeUsers" ? "active" : "curating"} N weeks later · pooled last ${HEADLINE_WINDOW} eligible cohorts · Δ vs prior ${HEADLINE_WINDOW}`}
      right={
        <ModeTabs
          options={METRIC_OPTIONS}
          value={metric}
          onChange={(k) => onMetricChange(k as RetentionMetric)}
          ariaLabel="retention metric"
        />
      }
    >
      <StatRow>
        {HEADLINE_OFFSETS.map((offset) => {
          const now = pooledRate(cohorts, offset, metric, HEADLINE_WINDOW);
          const prev = pooledRate(
            cohorts,
            offset,
            metric,
            HEADLINE_WINDOW,
            HEADLINE_WINDOW,
          );
          const d =
            now !== null && prev !== null
              ? computeDelta(now.rate * 100, prev.rate * 100)
              : undefined;
          const deltaColor =
            d === undefined
              ? "var(--text-dim)"
              : d.dir === "up"
                ? "var(--accent)"
                : d.dir === "down"
                  ? "#ef5b6b"
                  : "var(--text-dim)";
          return (
            <StatCell
              key={offset}
              label={`week ${offset} retention`}
              value={now !== null ? pct(now.rate) : "—"}
              delta={
                d !== undefined && prev !== null ? (
                  <span style={{ color: deltaColor }}>
                    {formatDelta(d, "pts")}{" "}
                    <span style={{ color: "var(--text-dim)" }}>
                      vs {pct(prev.rate)}
                    </span>
                  </span>
                ) : undefined
              }
              dimDelta={d === undefined}
            />
          );
        })}
      </StatRow>
    </Card>
  );
}

function TriangleCard({
  data,
  metric,
}: {
  data: RetentionStatsDTO;
  metric: RetentionMetric;
}) {
  const [rangeKey, setRangeKey] = useState("26w");
  const range =
    RANGE_OPTIONS.find((r) => r.key === rangeKey) ?? RANGE_OPTIONS[1];

  const sliced = useMemo(
    () =>
      range.weeks > 0 ? data.dataPoints.slice(-range.weeks) : data.dataPoints,
    [data.dataPoints, range.weeks],
  );

  const maxOffset = Math.min(
    MAX_TRIANGLE_OFFSETS,
    sliced.reduce((m, c) => Math.max(m, c.weeks.length), 0),
  );
  const offsets = Array.from({ length: maxOffset }, (_, i) => i + 1);
  const color = METRIC_COLORS[metric];

  const cellTitle = (c: RetentionDataPoint, offset: number): string => {
    const wk = c.weeks.find((w) => w.weekOffset === offset);
    if (!wk || c.cohortSize <= 0) return "";
    const users = wk[metric];
    return `${formatWeekShort(c.cohortWeekStart)} cohort · W${offset} · ${users}/${c.cohortSize} (${pct(users / c.cohortSize)})`;
  };

  const cellStyle: React.CSSProperties = {
    height: 22,
    minWidth: 30,
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: 10,
    fontVariantNumeric: "tabular-nums",
    borderRadius: 2,
  };

  return (
    <Card
      title="retention triangle"
      subtitle={`rows: signup cohorts · columns: weeks since signup (W1–W${maxOffset}) · cell: % of cohort ${metric === "activeUsers" ? "active" : "curating"}`}
      right={<RangeTabs value={rangeKey} onChange={setRangeKey} />}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "separate",
            borderSpacing: 2,
            width: "100%",
          }}
          aria-label="retention triangle heatmap"
        >
          <thead>
            <tr>
              <th style={{ ...headerStyle, textAlign: "left" }}>cohort</th>
              <th style={headerStyle}>size</th>
              {offsets.map((o) => (
                <th key={o} style={headerStyle}>
                  W{o}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sliced.map((c) => (
              <tr key={c.cohortWeekStart}>
                <td
                  style={{
                    fontSize: 10,
                    color: "var(--text-mid)",
                    whiteSpace: "nowrap",
                    paddingRight: 6,
                  }}
                >
                  {formatWeekShort(c.cohortWeekStart)}
                </td>
                <td
                  style={{
                    fontSize: 10,
                    color: "var(--text-dim)",
                    textAlign: "right",
                    paddingRight: 6,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {c.cohortSize}
                </td>
                {offsets.map((o) => {
                  const rate = cohortRate(c, o, metric);
                  if (rate === null) {
                    return <td key={o} style={cellStyle} />;
                  }
                  // Alpha floor keeps small-but-nonzero cells visible.
                  const alpha = rate === 0 ? 0.04 : 0.12 + rate * 0.85;
                  return (
                    <td
                      key={o}
                      style={{
                        ...cellStyle,
                        background: hexToRgba(color, alpha),
                        color: rate > 0.45 ? "var(--bg)" : "var(--text-hi)",
                      }}
                      title={cellTitle(c, o)}
                    >
                      {Math.round(rate * 100)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const headerStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 400,
  color: "var(--text-dim)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  textAlign: "center",
  padding: "0 2px 2px",
};

const TREND_SMOOTHING = 4; // cohorts are ~30–50 users; smooth per API guidance

function TrendCard({ data }: { data: RetentionStatsDTO }) {
  const [rangeKey, setRangeKey] = useState("52w");
  const range =
    RANGE_OPTIONS.find((r) => r.key === rangeKey) ?? RANGE_OPTIONS[2];

  // Cohorts that have reached W1 (drop the newest, still-unmeasured one).
  const measured = useMemo(
    () => data.dataPoints.filter((c) => c.weeks.length >= 1),
    [data.dataPoints],
  );
  const sliced = useMemo(
    () => (range.weeks > 0 ? measured.slice(-range.weeks) : measured),
    [measured, range.weeks],
  );

  const labels = sliced.map((c) => formatWeekShort(c.cohortWeekStart));
  const series = (["activeUsers", "curatingUsers"] as RetentionMetric[]).map(
    (metric) => {
      const raw = sliced.map((c) => cohortRate(c, 1, metric));
      const smooth = rollingAverage(raw, TREND_SMOOTHING);
      return {
        color: METRIC_COLORS[metric],
        filled: false,
        points: smooth.map((v, i) => ({ x: i, y: (v ?? 0) * 100 })),
      };
    },
  );

  return (
    <Card
      title="week-1 retention trend"
      subtitle={`% of each signup cohort active / curating one week later · ${TREND_SMOOTHING}-week rolling average`}
      right={<RangeTabs value={rangeKey} onChange={setRangeKey} />}
    >
      <HoverSparkline
        height={160}
        labels={labels}
        series={series}
        ariaLabel="Week-1 retention by signup cohort"
        formatValue={(y) => `${Math.round(y)}%`}
      />
      <div className={styles.stackedLegend}>
        <span className={styles.legendItem}>
          <span
            className={styles.dot}
            style={{ background: METRIC_COLORS.activeUsers }}
          />
          active · any activity
        </span>
        <span className={styles.legendItem}>
          <span
            className={styles.dot}
            style={{ background: METRIC_COLORS.curatingUsers }}
          />
          curating · collection or connection
        </span>
      </div>
    </Card>
  );
}

export function RetentionSection({ data }: Props) {
  const [metric, setMetric] = useState<RetentionMetric>("activeUsers");

  if (data.dataPoints.length === 0) {
    return (
      <Card title="retention">
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>no data</div>
      </Card>
    );
  }

  return (
    <>
      <HeadlineCard data={data} metric={metric} onMetricChange={setMetric} />
      <TriangleCard data={data} metric={metric} />
      <TrendCard data={data} />
    </>
  );
}
