import type { DailyMetrics } from "../types";
import {
  BarTimeline,
  CATEGORY_COLORS,
  Card,
  HoverSparkline,
  MiniLineGrid,
  StackedBarRow,
  StatCell,
  StatRow,
} from "./primitives";

interface ActivityChartsProps {
  dailyActivity: DailyMetrics[];
  dau?: number;
  wau?: number;
  mau?: number;
}

interface TotalUsersGrowthChartProps {
  dailyActivity: DailyMetrics[];
  totalUsers: number;
}

interface TotalRecordsBarChartProps {
  totalCreated: number;
  totalDeleted: number;
  totalActive: number;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function DailyActiveUsersChart({
  dailyActivity,
  dau,
  wau,
  mau,
}: ActivityChartsProps) {
  const last30 = dailyActivity.slice(-30);

  return (
    <Card title="active users" subtitle="dau · wau · mau">
      <StatRow>
        {dau !== undefined && (
          <StatCell
            label="dau (today)"
            value={dau.toLocaleString()}
            delta={
              mau && mau > 0
                ? `${((dau / mau) * 100).toFixed(1)}% of mau`
                : undefined
            }
            dimDelta
          />
        )}
        {wau !== undefined && (
          <StatCell
            label="wau (7d)"
            value={wau.toLocaleString()}
            delta={
              mau && mau > 0
                ? `${((wau / mau) * 100).toFixed(1)}% of mau`
                : undefined
            }
            dimDelta
          />
        )}
        {mau !== undefined && (
          <StatCell
            label="mau (30d)"
            value={mau.toLocaleString()}
            delta="total active"
            dimDelta
          />
        )}
      </StatRow>
      {last30.length > 0 && (
        <BarTimeline
          data={last30.map((d) => ({
            label: shortDate(d.date),
            value: d.activeUsers,
          }))}
          color={CATEGORY_COLORS.accent}
          height={70}
        />
      )}
    </Card>
  );
}

export function TotalUsersGrowthChart({
  dailyActivity,
  totalUsers,
}: TotalUsersGrowthChartProps) {
  const totalActivity = dailyActivity.reduce(
    (sum, day) => sum + day.activeUsers,
    0,
  );

  let cumulativeActivity = 0;
  const cumulative = dailyActivity.map((day, i) => {
    cumulativeActivity += day.activeUsers;
    const estimated =
      totalActivity > 0
        ? Math.round((cumulativeActivity / totalActivity) * totalUsers)
        : 0;
    return { x: i, y: estimated };
  });
  const active = dailyActivity.map((day, i) => ({
    x: i,
    y: day.activeUsers,
  }));
  const labels = dailyActivity.map((d) => shortDate(d.date));

  return (
    <Card
      title="total users (estimated)"
      subtitle="cumulative growth approximation"
    >
      <StatRow>
        <StatCell label="total" value={totalUsers.toLocaleString()} />
      </StatRow>
      <HoverSparkline
        height={90}
        labels={labels}
        series={[
          { color: CATEGORY_COLORS.accent, points: cumulative },
          {
            color: CATEGORY_COLORS.cards,
            points: active,
            filled: false,
          },
        ]}
        ariaLabel="Estimated cumulative user growth"
      />
    </Card>
  );
}

export function RecordsCreatedChart({ dailyActivity }: ActivityChartsProps) {
  const cards = dailyActivity.map((d, i) => ({ x: i, y: d.cards.created }));
  const collections = dailyActivity.map((d, i) => ({
    x: i,
    y: d.collections.created,
  }));
  const follows = dailyActivity.map((d, i) => ({
    x: i,
    y: d.follows.created,
  }));
  const connections = dailyActivity.map((d, i) => ({
    x: i,
    y: d.connections.created,
  }));
  const collectionLinks = dailyActivity.map((d, i) => ({
    x: i,
    y: d.collectionLinks.created,
  }));

  return (
    <Card title="records created" subtitle="30 days · per type">
      <MiniLineGrid
        cells={[
          {
            name: "cards",
            color: CATEGORY_COLORS.cards,
            points: cards,
          },
          {
            name: "collections",
            color: CATEGORY_COLORS.collections,
            points: collections,
          },
          {
            name: "follows",
            color: CATEGORY_COLORS.follows,
            points: follows,
          },
          {
            name: "connections",
            color: CATEGORY_COLORS.connections,
            points: connections,
          },
          {
            name: "collection links",
            color: CATEGORY_COLORS.collectionLinks,
            points: collectionLinks,
          },
        ]}
      />
    </Card>
  );
}

export function CombinedActivityChart({ dailyActivity }: ActivityChartsProps) {
  const labels = dailyActivity.map((d) => shortDate(d.date));
  const total = dailyActivity.map((d, i) => ({
    x: i,
    y:
      d.cards.created +
      d.collections.created +
      d.follows.created +
      d.connections.created +
      d.collectionLinks.created,
  }));
  const users = dailyActivity.map((d, i) => ({ x: i, y: d.activeUsers }));
  const cards = dailyActivity.map((d, i) => ({ x: i, y: d.cards.created }));
  const collections = dailyActivity.map((d, i) => ({
    x: i,
    y: d.collections.created,
  }));
  const follows = dailyActivity.map((d, i) => ({
    x: i,
    y: d.follows.created,
  }));
  const connections = dailyActivity.map((d, i) => ({
    x: i,
    y: d.connections.created,
  }));
  const collectionLinks = dailyActivity.map((d, i) => ({
    x: i,
    y: d.collectionLinks.created,
  }));

  return (
    <Card title="activity overview" subtitle="full timeline">
      <HoverSparkline
        height={110}
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
          {
            color: CATEGORY_COLORS.connections,
            points: connections,
            filled: false,
          },
          {
            color: CATEGORY_COLORS.collectionLinks,
            points: collectionLinks,
            filled: false,
          },
          { color: CATEGORY_COLORS.newUsers, points: users, filled: false },
        ]}
        ariaLabel="Activity overview timeline"
      />
    </Card>
  );
}

export function TotalRecordsBarChart({
  totalCreated,
  totalDeleted,
  totalActive,
}: TotalRecordsBarChartProps) {
  return (
    <Card title="total records" subtitle="active vs deleted">
      <StatRow>
        <StatCell label="active" value={totalActive.toLocaleString()} />
        <StatCell label="created" value={totalCreated.toLocaleString()} />
        <StatCell label="deleted" value={totalDeleted.toLocaleString()} />
      </StatRow>
      <StackedBarRow
        segments={[
          {
            label: "active",
            value: totalActive,
            color: CATEGORY_COLORS.active,
          },
          {
            label: "deleted",
            value: Math.max(totalDeleted, 0),
            color: CATEGORY_COLORS.deleted,
          },
        ]}
      />
    </Card>
  );
}
