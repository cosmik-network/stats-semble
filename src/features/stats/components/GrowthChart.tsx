import type { GrowthStats } from "../types/stats";
import {
  CATEGORY_COLORS,
  Card,
  HoverSparkline,
  StatCell,
  StatRow,
} from "./primitives";

interface GrowthChartProps {
  data: GrowthStats;
}

export function GrowthChart({ data }: GrowthChartProps) {
  const points = data.dataPoints;
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

  return (
    <>
      <Card title="total users" subtitle="last 30 days">
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
          ariaLabel="Total users over the last 30 days"
        />
      </Card>
      <Card title="new users" subtitle="last 30 days">
        <StatRow>
          <StatCell
            label="new (30d)"
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
          ariaLabel="New users over the last 30 days"
        />
      </Card>
    </>
  );
}
