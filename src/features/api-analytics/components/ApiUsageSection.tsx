"use client";

import { useMemo, useState } from "react";
import { Card, MetricRow } from "@/features/stats/components/primitives";
import {
  formatWeekRange,
  formatWeekShort,
} from "@/features/product-analytics/lib/shared";
import { WeekNav } from "@/features/product-analytics/components/WeekNav";
import type { ApiUsageStatsDTO } from "../types";

interface Props {
  data: ApiUsageStatsDTO;
}

// Reuses the product analytics palette so the tabs read alike.
const SOURCE_COLORS = [
  "#5b8def",
  "#a07bf0",
  "#3ec97a",
  "#f0b65b",
  "#e06bab",
  "#f0865b",
  "#7b84ef",
  "#c471d8",
] as const;

export function ApiUsageSection({ data }: Props) {
  const points = data.dataPoints;
  const n = points.length;

  // Headline week index: default to most recent week.
  const [idx, setIdx] = useState(n - 1);

  // Stable per-source color, keyed by all-time rank.
  const colorFor = useMemo(() => {
    const map = new Map<string, string>();
    data.totals.forEach((t, i) => {
      map.set(t.source, SOURCE_COLORS[i % SOURCE_COLORS.length]);
    });
    return (source: string): string =>
      map.get(source) ?? SOURCE_COLORS[map.size % SOURCE_COLORS.length];
  }, [data.totals]);

  const current = points[idx];

  if (n === 0 || !current) {
    return (
      <Card title="api usage">
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>no data</div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title="api usage · weekly"
        subtitle={`week of ${formatWeekRange(current.weekStart)} · users per source`}
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
        {current.sources.length === 0 ? (
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
            no api usage this week
          </div>
        ) : (
          <div>
            {current.sources.map((s) => (
              <MetricRow
                key={s.source}
                color={colorFor(s.source)}
                label={s.source}
                value={s.users.toLocaleString()}
                secondary={`(${s.calls.toLocaleString()} calls)`}
              />
            ))}
          </div>
        )}
      </Card>

      <Card title="api usage · all time" subtitle="users per source">
        {data.totals.length === 0 ? (
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>no data</div>
        ) : (
          <div>
            {data.totals.map((t) => (
              <MetricRow
                key={t.source}
                color={colorFor(t.source)}
                label={t.source}
                value={t.users.toLocaleString()}
                secondary={`(${t.calls.toLocaleString()} calls)`}
              />
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
