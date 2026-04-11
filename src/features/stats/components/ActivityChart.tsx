import type { ActivityStats } from "../types/stats";
import {
  CATEGORY_COLORS,
  Card,
  HoverSparkline,
  MetricRow,
  StatCell,
  StatRow,
} from "./primitives";

interface ActivityChartProps {
  data: ActivityStats;
}

export function ActivityChart({ data }: ActivityChartProps) {
  const points = data.dataPoints;
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

  const rows = [
    {
      label: "cards created",
      value: data.totals.cardsCreated,
      color: CATEGORY_COLORS.cards,
    },
    {
      label: "collections created",
      value: data.totals.collectionsCreated,
      color: CATEGORY_COLORS.collections,
    },
    {
      label: "connections created",
      value: data.totals.connectionsCreated,
      color: CATEGORY_COLORS.connections,
    },
    {
      label: "follows created",
      value: data.totals.followsCreated,
      color: CATEGORY_COLORS.follows,
    },
  ].sort((a, b) => b.value - a.value);
  const maxRow = rows.reduce((m, r) => (r.value > m ? r.value : m), 0);

  return (
    <Card title="content activity" subtitle="last 30 days">
      <StatRow>
        <StatCell
          label="total actions"
          value={data.totals.totalActions.toLocaleString()}
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
