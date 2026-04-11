import type { BreakdownStats } from "../types/stats";
import {
  CATEGORY_COLORS,
  Card,
  MetricRow,
  SectionHeading,
} from "./primitives";

interface BreakdownChartsProps {
  data: BreakdownStats;
}

interface Group {
  title: string;
  total: number;
  color: string;
  items: { label: string; value: number }[];
}

function toItems(
  record: Record<string, number>,
  transformLabel: (s: string) => string = (s) => s,
): { label: string; value: number }[] {
  return Object.entries(record)
    .map(([k, v]) => ({ label: transformLabel(k), value: v }))
    .sort((a, b) => b.value - a.value);
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function BreakdownCharts({ data }: BreakdownChartsProps) {
  const groups: Group[] = [
    {
      title: "url cards by type",
      total: data.currentTotals.urlCards.total,
      color: CATEGORY_COLORS.cards,
      items: toItems(data.currentTotals.urlCards.byType, titleCase),
    },
    {
      title: "collections by access",
      total: data.currentTotals.collections.total,
      color: CATEGORY_COLORS.collections,
      items: toItems(data.currentTotals.collections.byAccessType),
    },
    {
      title: "connections by type",
      total: data.currentTotals.connections.total,
      color: CATEGORY_COLORS.connections,
      items: toItems(data.currentTotals.connections.byType, titleCase),
    },
  ];

  return (
    <Card title="breakdown" subtitle="current totals by category">
      {groups.map((group) => {
        const max = group.items.reduce(
          (m, it) => (it.value > m ? it.value : m),
          0,
        );
        return (
          <div key={group.title}>
            <SectionHeading
              title={group.title}
              right={
                <span
                  style={{ fontSize: 11, color: "var(--text-hi)" }}
                  className="mono"
                >
                  {group.total.toLocaleString()}
                </span>
              }
            />
            <div>
              {group.items.length === 0 && (
                <div style={{ fontSize: 11, color: "var(--text-dim)", padding: "6px 0" }}>
                  no data
                </div>
              )}
              {group.items.map((it) => (
                <MetricRow
                  key={it.label}
                  color={group.color}
                  label={it.label}
                  value={it.value.toLocaleString()}
                  barFraction={max > 0 ? it.value / max : 0}
                />
              ))}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
