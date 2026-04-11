import type { EngagementStats } from "../types/stats";
import {
  CATEGORY_COLORS,
  Card,
  MetricRow,
  StackedBarRow,
  StatCell,
  StatRow,
} from "./primitives";

interface EngagementOverviewChartProps {
  data: EngagementStats;
}

export function EngagementOverviewChart({
  data,
}: EngagementOverviewChartProps) {
  const activationPct = (data.activationRate * 100).toFixed(1);
  const rows: {
    label: string;
    value: number;
    color: string;
  }[] = [
    {
      label: "with cards",
      value: data.usersWithCards,
      color: CATEGORY_COLORS.cards,
    },
    {
      label: "with collections",
      value: data.usersWithCollections,
      color: CATEGORY_COLORS.collections,
    },
    {
      label: "with connections",
      value: data.usersWithConnections,
      color: CATEGORY_COLORS.connections,
    },
    {
      label: "with follows",
      value: data.usersWithFollows,
      color: CATEGORY_COLORS.follows,
    },
    {
      label: "with contributions",
      value: data.usersWithContributions,
      color: CATEGORY_COLORS.contributions,
    },
  ].sort((a, b) => b.value - a.value);

  const maxRow = rows.reduce((m, r) => (r.value > m ? r.value : m), 0);

  return (
    <Card title="engagement" subtitle="activation + activity mix">
      <StatRow>
        <StatCell label="activation" value={`${activationPct}%`} />
        <StatCell label="total users" value={data.totalUsers.toLocaleString()} />
        <StatCell
          label="active"
          value={data.activeUsers.toLocaleString()}
          delta={`of ${data.totalUsers.toLocaleString()}`}
          dimDelta
        />
        <StatCell
          label="avg actions"
          value={data.avgActionsPerActiveUser.toFixed(1)}
          delta="per active user"
          dimDelta
        />
      </StatRow>

      <StackedBarRow
        segments={[
          {
            label: "active",
            value: data.activeUsers,
            color: CATEGORY_COLORS.active,
          },
          {
            label: "inactive",
            value: data.inactiveUsers,
            color: CATEGORY_COLORS.inactive,
          },
        ]}
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
