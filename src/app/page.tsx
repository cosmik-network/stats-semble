import DashboardTabs from "@/features/navigation/components/dashboard-tabs/DashboardTabs";
import { SembleAnalytics } from "@/features/stats/lib/analytics";
import { ActivityChart } from "@/features/stats/components/ActivityChart";
import {
  CombinedActivityChart,
  DailyActiveUsersChart,
  RecordsCreatedChart,
  TotalRecordsBarChart,
  TotalUsersGrowthChart,
} from "@/features/stats/components/ActivityCharts";
import { BreakdownCharts } from "@/features/stats/components/BreakdownCharts";
import { EngagementOverviewChart } from "@/features/stats/components/EngagementOverviewChart";
import { GrowthChart } from "@/features/stats/components/GrowthChart";
import { StatsClient } from "@/features/stats/lib/stats-dal";
import {
  CATEGORY_COLORS,
  Card,
  MetricRow,
  SectionHeading,
  StatCell,
  StatRow,
} from "@/features/stats/components/primitives";
import { Suspense } from "react";
import { cacheLife } from "next/cache";

async function getOverallAnalytics() {
  "use cache";
  cacheLife("minutes");
  const analytics = new SembleAnalytics();
  return analytics.getAnalytics();
}

async function getActiveUserMetrics() {
  "use cache";
  cacheLife("minutes");
  const analytics = new SembleAnalytics();
  const [dau, wau, mau] = await Promise.all([
    analytics.getCurrentDAU(),
    analytics.getWeeklyActiveUsers(),
    analytics.getMonthlyActiveUsers(),
  ]);
  return { dau, wau, mau };
}

async function getDailyActivity() {
  "use cache";
  cacheLife("minutes");
  const analytics = new SembleAnalytics();
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return analytics.getDailyActiveUsers(
    thirtyDaysAgo.toISOString(),
    now.toISOString(),
  );
}

async function getYearlyDailyActivity() {
  "use cache";
  cacheLife("minutes");
  const analytics = new SembleAnalytics();
  const now = new Date();
  const eightMonthsAgo = new Date(now);
  eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8);

  return analytics.getDailyActiveUsers(
    eightMonthsAgo.toISOString(),
    now.toISOString(),
  );
}

async function getHistoricalDailyActivity() {
  "use cache";
  cacheLife("minutes");
  const analytics = new SembleAnalytics();
  const now = new Date();
  const startDate = new Date("2025-11-03T00:00:00Z");

  return analytics.getDailyActiveUsers(
    startDate.toISOString(),
    now.toISOString(),
  );
}

async function getGrowthStats() {
  "use cache";
  cacheLife("minutes");
  const client = new StatsClient();
  return client.getGrowth("day", 90);
}

async function getEngagementStats() {
  "use cache";
  cacheLife("minutes");
  const client = new StatsClient();
  return client.getEngagement();
}

async function getActivityStats() {
  "use cache";
  cacheLife("minutes");
  const client = new StatsClient();
  return client.getActivity("day", 30);
}

async function getBreakdownStats() {
  "use cache";
  cacheLife("minutes");
  const client = new StatsClient();
  return client.getBreakdown("day", 30);
}

async function getFetchedAt() {
  "use cache";
  cacheLife("minutes");
  return new Date().toISOString();
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

async function OverallStatsSection() {
  const [overallStats, historicalActivity] = await Promise.all([
    getOverallAnalytics(),
    getHistoricalDailyActivity(),
  ]);

  return (
    <>
      <TotalUsersGrowthChart
        dailyActivity={historicalActivity}
        totalUsers={overallStats.uniqueUsersEstimate}
      />
      <TotalRecordsBarChart
        totalCreated={overallStats.totalRecordsCreated}
        totalDeleted={
          overallStats.totalRecordsCreated - overallStats.totalRecordsActive
        }
        totalActive={overallStats.totalRecordsActive}
      />
    </>
  );
}

async function ActiveUsersSection() {
  const [activeUsers, dailyActivity] = await Promise.all([
    getActiveUserMetrics(),
    getDailyActivity(),
  ]);

  return (
    <DailyActiveUsersChart
      dailyActivity={dailyActivity}
      dau={activeUsers.dau}
      wau={activeUsers.wau}
      mau={activeUsers.mau}
    />
  );
}

async function RecordsByTypeSection() {
  const [overallStats, dailyActivity] = await Promise.all([
    getOverallAnalytics(),
    getDailyActivity(),
  ]);

  const recent = dailyActivity.slice(-7);
  const sum7 = (key: "cards" | "collections" | "follows") =>
    recent.reduce((s, d) => s + d[key].created, 0);

  const types: {
    name: string;
    color: string;
    active: number;
    created: number;
    updated: number;
    recent7: number;
  }[] = [
    {
      name: "cards",
      color: CATEGORY_COLORS.cards,
      active: overallStats.recordsByType.cards.active,
      created: overallStats.recordsByType.cards.created,
      updated: overallStats.recordsByType.cards.updated,
      recent7: sum7("cards"),
    },
    {
      name: "collections",
      color: CATEGORY_COLORS.collections,
      active: overallStats.recordsByType.collections.active,
      created: overallStats.recordsByType.collections.created,
      updated: overallStats.recordsByType.collections.updated,
      recent7: sum7("collections"),
    },
    {
      name: "follows",
      color: CATEGORY_COLORS.follows,
      active: overallStats.recordsByType.follows.active,
      created: overallStats.recordsByType.follows.created,
      updated: overallStats.recordsByType.follows.updated,
      recent7: sum7("follows"),
    },
  ];

  return (
    <>
      <RecordsCreatedChart dailyActivity={dailyActivity} />
      <Card title="records by type" subtitle="active · all-time · last 7d">
        {types.map((t) => (
          <div key={t.name}>
            <SectionHeading
              title={t.name}
              color={t.color}
              right={
                <span
                  style={{
                    fontSize: 11,
                    color: t.color,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  +{t.recent7.toLocaleString()} / 7d
                </span>
              }
            />
            <div>
              <MetricRow
                color={t.color}
                label="active"
                value={t.active.toLocaleString()}
              />
              <MetricRow
                color={t.color}
                label="all-time created"
                value={t.created.toLocaleString()}
              />
              <MetricRow
                color={t.color}
                label="all-time updated"
                value={t.updated.toLocaleString()}
              />
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

async function RecentActivitySection() {
  const [dailyActivity, yearlyActivity] = await Promise.all([
    getDailyActivity(),
    getYearlyDailyActivity(),
  ]);
  const recent = dailyActivity.slice(-7).reverse();

  return (
    <>
      <CombinedActivityChart dailyActivity={yearlyActivity} />
      <Card
        title="recent activity"
        subtitle="last 7 days · (n) updated records"
      >
        {recent.map((day) => (
          <div key={day.date}>
            <SectionHeading
              title={shortDate(day.date)}
              right={
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-hi)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {day.activeUsers} active
                </span>
              }
            />
            <div>
              <MetricRow
                color={CATEGORY_COLORS.cards}
                label="cards"
                value={`+${day.cards.created}`}
                secondary={
                  day.cards.updated > 0 ? `(${day.cards.updated})` : undefined
                }
              />
              <MetricRow
                color={CATEGORY_COLORS.collections}
                label="collections"
                value={`+${day.collections.created}`}
                secondary={
                  day.collections.updated > 0
                    ? `(${day.collections.updated})`
                    : undefined
                }
              />
              <MetricRow
                color={CATEGORY_COLORS.follows}
                label="follows"
                value={`+${day.follows.created}`}
                secondary={
                  day.follows.updated > 0
                    ? `(${day.follows.updated})`
                    : undefined
                }
              />
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

async function StatsGrowthSection() {
  const growthData = await getGrowthStats();
  return <GrowthChart data={growthData} />;
}

async function StatsEngagementSection() {
  const engagementData = await getEngagementStats();
  return <EngagementOverviewChart data={engagementData} />;
}

async function StatsActivitySection() {
  const activityData = await getActivityStats();
  return <ActivityChart data={activityData} />;
}

async function StatsBreakdownSection() {
  const breakdownData = await getBreakdownStats();
  return <BreakdownCharts data={breakdownData} />;
}

async function OverallTotalsSection() {
  const overall = await getOverallAnalytics();
  return (
    <Card title="semble network" subtitle="overall totals">
      <StatRow>
        <StatCell
          label="users"
          value={overall.uniqueUsersEstimate.toLocaleString()}
        />
        <StatCell
          label="records active"
          value={overall.totalRecordsActive.toLocaleString()}
        />
        <StatCell
          label="records created"
          value={overall.totalRecordsCreated.toLocaleString()}
        />
      </StatRow>
    </Card>
  );
}

function LoadingState({ label = "loading" }: { label?: string }) {
  return (
    <Card>
      <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{label}…</div>
    </Card>
  );
}

export default async function Home() {
  const lastUpdated = await getFetchedAt();

  const ufoContent = (
    <>
      <Suspense fallback={<LoadingState />}>
        <OverallTotalsSection />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        <OverallStatsSection />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        <ActiveUsersSection />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        <RecordsByTypeSection />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        <RecentActivitySection />
      </Suspense>
    </>
  );

  const dbContent = (
    <>
      <Suspense fallback={<LoadingState />}>
        <StatsGrowthSection />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        <StatsEngagementSection />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        <StatsActivitySection />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        <StatsBreakdownSection />
      </Suspense>
    </>
  );

  return (
    <main className="term-root">
      <DashboardTabs
        ufoContent={ufoContent}
        dbContent={dbContent}
        lastUpdated={lastUpdated}
      />
    </main>
  );
}
