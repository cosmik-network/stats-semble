"use client";

import { useMemo, useState } from "react";
import { Card, HoverSparkline } from "@/features/stats/components/primitives";
import styles from "@/features/stats/components/primitives/primitives.module.css";
import type {
  RetentionSegmentBy,
  RetentionSegmentDataPoint,
  RetentionSegmentsStatsDTO,
} from "../types";
import { formatWeekShort, segmentColor } from "../lib/shared";
import { ModeTabs } from "./ModeTabs";

interface Props {
  onboarding: RetentionSegmentsStatsDTO;
  notified: RetentionSegmentsStatsDTO;
}

const SEGMENT_BY_OPTIONS = [
  { key: "onboardingState", label: "onboarding" },
  { key: "notifiedFirstWeek", label: "notified" },
];

const MAX_CURVE_OFFSETS = 26;
const TABLE_OFFSETS = [1, 4, 8];

function segmentRate(
  s: RetentionSegmentDataPoint,
  offset: number,
): number | null {
  const wk = s.weeks.find((w) => w.weekOffset === offset);
  if (!wk || wk.eligibleUsers <= 0) return null;
  return wk.activeUsers / wk.eligibleUsers;
}

export function RetentionSegmentsSection({ onboarding, notified }: Props) {
  const [segmentBy, setSegmentBy] =
    useState<RetentionSegmentBy>("onboardingState");
  const data = segmentBy === "onboardingState" ? onboarding : notified;
  const segments = data.dataPoints;

  // Show offsets every segment can still answer (eligibleUsers > 0), capped
  // for readability; series must share a length for aligned x positions.
  const maxOffset = useMemo(() => {
    let m = 0;
    for (let o = 1; o <= MAX_CURVE_OFFSETS; o++) {
      if (segments.every((s) => segmentRate(s, o) !== null)) m = o;
      else break;
    }
    return m;
  }, [segments]);

  const offsets = Array.from({ length: maxOffset }, (_, i) => i + 1);
  const labels = offsets.map((o) => `W${o}`);
  const series = segments.map((s) => ({
    color: segmentColor(s.segment),
    filled: false,
    points: offsets.map((o, i) => ({
      x: i,
      y: (segmentRate(s, o) ?? 0) * 100,
    })),
  }));

  if (segments.length === 0 || maxOffset === 0) {
    return (
      <Card title="retention by segment">
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>no data</div>
      </Card>
    );
  }

  return (
    <Card
      title="retention by segment"
      subtitle={`pooled cohorts ${formatWeekShort(data.periodStart)} – ${formatWeekShort(data.periodEnd)} · % of eligible users active per week since signup${segmentBy === "notifiedFirstWeek" ? " · correlational, not causal" : ""}`}
      right={
        <ModeTabs
          options={SEGMENT_BY_OPTIONS}
          value={segmentBy}
          onChange={(k) => setSegmentBy(k as RetentionSegmentBy)}
          ariaLabel="segment by"
        />
      }
    >
      <HoverSparkline
        height={160}
        labels={labels}
        series={series}
        ariaLabel="Retention curves by segment"
        formatValue={(y) => `${Math.round(y)}%`}
      />
      <div className={styles.stackedLegend}>
        {segments.map((s) => (
          <span key={s.segment} className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ background: segmentColor(s.segment) }}
            />
            {s.segment.toLowerCase().replace(/_/g, " ")}
          </span>
        ))}
      </div>

      <div style={{ overflowX: "auto", marginTop: 10 }}>
        <table
          style={{ borderCollapse: "collapse", width: "100%" }}
          aria-label="retention by segment"
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: "left" }}>segment</th>
              <th style={thStyle}>users</th>
              {TABLE_OFFSETS.map((o) => (
                <th key={o} style={thStyle}>
                  W{o}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {segments.map((s) => (
              <tr key={s.segment}>
                <td style={{ ...tdStyle, textAlign: "left" }}>
                  <span
                    className={styles.dot}
                    style={{
                      background: segmentColor(s.segment),
                      marginRight: 6,
                    }}
                  />
                  {s.segment.toLowerCase().replace(/_/g, " ")}
                </td>
                <td style={tdStyle}>{s.userCount.toLocaleString()}</td>
                {TABLE_OFFSETS.map((o) => {
                  const rate = segmentRate(s, o);
                  return (
                    <td key={o} style={tdStyle}>
                      {rate !== null ? `${Math.round(rate * 100)}%` : "—"}
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

const thStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 400,
  color: "var(--text-dim)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  textAlign: "right",
  padding: "2px 6px",
  borderBottom: "1px solid var(--border-2)",
};

const tdStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-hi)",
  textAlign: "right",
  padding: "4px 6px",
  fontVariantNumeric: "tabular-nums",
  borderBottom: "1px solid var(--border)",
  whiteSpace: "nowrap",
};
