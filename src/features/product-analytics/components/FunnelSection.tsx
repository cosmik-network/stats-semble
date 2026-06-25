"use client";

import { useMemo, useState } from "react";
import { Card, HoverSparkline } from "@/features/stats/components/primitives";
import styles from "@/features/stats/components/primitives/primitives.module.css";
import type {
  ActivationFunnelStatsDTO,
  ActivationFunnelDataPoint,
} from "../types";
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
  data: ActivationFunnelStatsDTO;
}

type RungKey = "savedUrlCard7d" | "curated14d" | "notified30d";

interface RungDef {
  key: RungKey;
  name: string;
  event: string;
  color: string;
}

// Real DTO has 3 rungs after signups (signups is the cohort base / 100%).
const RUNGS: RungDef[] = [
  {
    key: "savedUrlCard7d",
    name: "first save",
    event: "url card · 7d",
    color: PA_COLORS.save,
  },
  {
    key: "curated14d",
    name: "first enrich",
    event: "collection / connection · 14d",
    color: PA_COLORS.enrich,
  },
  {
    key: "notified30d",
    name: "first inbound signal",
    event: "notification · 30d",
    color: PA_COLORS.inbound,
  },
];

function pctOfSignups(p: ActivationFunnelDataPoint, key: RungKey): number {
  return p.signups > 0 ? (p[key] / p.signups) * 100 : 0;
}

function FunnelSummary({ data }: { data: ActivationFunnelStatsDTO }) {
  const points = data.dataPoints;
  const n = points.length;
  const [idx, setIdx] = useState(n - 1);

  const current = points[idx];
  const prior = idx > 0 ? points[idx - 1] : undefined;

  if (n === 0 || !current) {
    return (
      <Card title="activation funnel — this week">
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>no data</div>
      </Card>
    );
  }

  return (
    <Card
      title="activation funnel — this week"
      subtitle={`cohort week of ${formatWeekRange(current.cohortWeekStart)} · conversion vs signups · Δ vs prior week`}
      right={
        <WeekNav
          label={formatWeekShort(current.cohortWeekStart)}
          onPrev={() => setIdx((i) => Math.max(0, i - 1))}
          onNext={() => setIdx((i) => Math.min(n - 1, i + 1))}
          canPrev={idx > 0}
          canNext={idx < n - 1}
        />
      }
    >
      {/* Signups — the cohort base */}
      <div className={styles.metricRow}>
        <div className={styles.metricLeft}>
          <span
            className={styles.dot}
            style={{ background: PA_COLORS.signup }}
          />
          <span className={styles.metricLabel}>
            signups{" "}
            <span style={{ color: "var(--text-dim)" }}>account created</span>
          </span>
        </div>
        <span className={styles.metricValue}>
          {current.signups.toLocaleString()}
          {prior !== undefined && (
            <span className={styles.metricSecondary}>
              {formatDelta(computeDelta(current.signups, prior.signups))} WoW
            </span>
          )}
        </span>
      </div>

      {RUNGS.map((r) => {
        const pct = pctOfSignups(current, r.key);
        const priorPct =
          prior !== undefined ? pctOfSignups(prior, r.key) : undefined;
        const d = computeDelta(pct, priorPct);
        const deltaColor =
          d.dir === "up"
            ? "var(--accent)"
            : d.dir === "down"
              ? "#ef5b6b"
              : "var(--text-dim)";
        return (
          <div key={r.key}>
            <div className={styles.metricRow} style={{ borderBottom: "none" }}>
              <div className={styles.metricLeft}>
                <span className={styles.dot} style={{ background: r.color }} />
                <span className={styles.metricLabel}>
                  {r.name}{" "}
                  <span style={{ color: "var(--text-dim)" }}>{r.event}</span>
                </span>
              </div>
              <span className={styles.metricValue} style={{ color: r.color }}>
                {pct.toFixed(0)}%
              </span>
            </div>
            <div
              className={styles.metricRow}
              style={{ paddingTop: 0, fontSize: 11, color: "var(--text-mid)" }}
            >
              <span>{current[r.key].toLocaleString()} users</span>
              {priorPct !== undefined && (
                <span style={{ color: deltaColor }}>
                  {formatDelta(d, "pts")} vs prior week
                </span>
              )}
            </div>
            {/* conversion bar */}
            <div
              className={styles.metricBar}
              style={{ margin: "0 0 8px", height: 7 }}
            >
              <div
                style={{
                  width: `${Math.min(pct, 100).toFixed(2)}%`,
                  height: "100%",
                  background: r.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </Card>
  );
}

function FunnelChart({
  data,
  mode,
}: {
  data: ActivationFunnelStatsDTO;
  mode: "pct" | "abs";
}) {
  const points = data.dataPoints;
  const [rangeKey, setRangeKey] = useState("26w");
  const range =
    RANGE_OPTIONS.find((r) => r.key === rangeKey) ?? RANGE_OPTIONS[1];

  const sliced = useMemo(
    () => (range.weeks > 0 ? points.slice(-range.weeks) : points),
    [points, range.weeks],
  );

  const labels = sliced.map((p) => formatWeekShort(p.cohortWeekStart));
  const series = RUNGS.map((r) => ({
    color: r.color,
    filled: mode === "abs",
    points: sliced.map((p, i) => ({
      x: i,
      y: mode === "pct" ? pctOfSignups(p, r.key) : p[r.key],
    })),
  }));

  const title =
    mode === "pct"
      ? "funnel — conversion % by rung"
      : "funnel — absolute users by rung";
  const subtitle =
    mode === "pct"
      ? "% of signups reaching each rung, per cohort week"
      : "users reaching each rung, per cohort week";

  return (
    <Card
      title={title}
      subtitle={subtitle}
      right={<RangeTabs value={rangeKey} onChange={setRangeKey} />}
    >
      <HoverSparkline
        height={180}
        labels={labels}
        series={series}
        ariaLabel={title}
        formatValue={
          mode === "pct"
            ? (y) => `${Math.round(y)}%`
            : (y) => y.toLocaleString()
        }
      />
      <div className={styles.stackedLegend}>
        {RUNGS.map((r) => (
          <span key={r.key} className={styles.legendItem}>
            <span className={styles.dot} style={{ background: r.color }} />
            {r.name}
          </span>
        ))}
      </div>
    </Card>
  );
}

export function FunnelSection({ data }: Props) {
  return (
    <>
      <FunnelSummary data={data} />
      <FunnelChart data={data} mode="pct" />
      <FunnelChart data={data} mode="abs" />
    </>
  );
}
