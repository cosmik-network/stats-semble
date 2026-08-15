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
import { ProductAnalyticsClient } from "@/features/product-analytics/lib/dal";
import { WacSection } from "@/features/product-analytics/components/WacSection";
import { FunnelSection } from "@/features/product-analytics/components/FunnelSection";
import { ApiAnalyticsClient } from "@/features/api-analytics/lib/dal";
import { ApiUsageSection } from "@/features/api-analytics/components/ApiUsageSection";
import { OnboardingAnalyticsClient } from "@/features/onboarding-analytics/lib/dal";
import { currentWeekStart } from "@/features/onboarding-analytics/lib/shared";
import { OnboardingWeeklySection } from "@/features/onboarding-analytics/components/OnboardingWeeklySection";
import { OnboardingSummarySection } from "@/features/onboarding-analytics/components/OnboardingSummarySection";
import { PasswordGate } from "@/features/onboarding-analytics/components/PasswordGate";
import { LockButton } from "@/features/onboarding-analytics/components/LockButton";
import {
  hasOnboardingAccess,
  isGateDisabled,
} from "@/features/onboarding-analytics/lib/auth";
import {
  CATEGORY_COLORS,
  Card,
  MetricRow,
  SectionHeading,
  StatCell,
  StatRow,
} from "@/features/stats/components/primitives";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

async function getOverallAnalytics() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");
  const analytics = new SembleAnalytics();
  return analytics.getAnalytics();
}

async function getActiveUserMetrics() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");
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
  cacheTag("dashboard");
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
  cacheTag("dashboard");
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
  cacheTag("dashboard");
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
  cacheTag("dashboard");
  const client = new StatsClient();
  return client.getGrowth("day", 90);
}

async function getEngagementStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");
  const client = new StatsClient();
  return client.getEngagement();
}

async function getActivityStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");
  const client = new StatsClient();
  return client.getActivity("day", 90);
}

async function getBreakdownStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");
  const client = new StatsClient();
  return client.getBreakdown("day", 30);
}

async function getWacStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");
  // weeks=0 => all-time, so the client can navigate every week.
  const client = new ProductAnalyticsClient();
  return client.getWac(undefined, 0);
}

async function getActivationFunnelStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");
  const client = new ProductAnalyticsClient();
  return client.getActivationFunnel(undefined, 0);
}

async function getApiUsageStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");
  // endWeek => the current (still-incomplete) week; weeks=0 => all-time, so
  // the client can navigate every week from one payload.
  const client = new ApiAnalyticsClient();
  return client.getApiUsage(currentWeekStart(), 0);
}

async function getOnboardingWeeklyStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");
  // Explicit endWeek => the current (still-incomplete) week; the client
  // navigates back from there.
  const client = new OnboardingAnalyticsClient();
  return client.getWeekly(currentWeekStart());
}

async function getOnboardingSummaryStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");
  const client = new OnboardingAnalyticsClient();
  return client.getSummary();
}

async function getFetchedAt() {
  "use cache";
  cacheLife("minutes");
  cacheTag("dashboard");
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
  const sum7 = (
    key:
      | "cards"
      | "collections"
      | "follows"
      | "connections"
      | "collectionLinks",
  ) => recent.reduce((s, d) => s + d[key].created, 0);

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
    {
      name: "connections",
      color: CATEGORY_COLORS.connections,
      active: overallStats.recordsByType.connections.active,
      created: overallStats.recordsByType.connections.created,
      updated: overallStats.recordsByType.connections.updated,
      recent7: sum7("connections"),
    },
    {
      name: "collection links",
      color: CATEGORY_COLORS.collectionLinks,
      active: overallStats.recordsByType.collectionLinks.active,
      created: overallStats.recordsByType.collectionLinks.created,
      updated: overallStats.recordsByType.collectionLinks.updated,
      recent7: sum7("collectionLinks"),
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
              <MetricRow
                color={CATEGORY_COLORS.connections}
                label="connections"
                value={`+${day.connections.created}`}
                secondary={
                  day.connections.updated > 0
                    ? `(${day.connections.updated})`
                    : undefined
                }
              />
              <MetricRow
                color={CATEGORY_COLORS.collectionLinks}
                label="collection links"
                value={`+${day.collectionLinks.created}`}
                secondary={
                  day.collectionLinks.updated > 0
                    ? `(${day.collectionLinks.updated})`
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

async function ProductWacSection() {
  const wacData = await getWacStats();
  return <WacSection data={wacData} />;
}

async function ProductFunnelSection() {
  const funnelData = await getActivationFunnelStats();
  return <FunnelSection data={funnelData} />;
}

// Password-gated. The access check runs BEFORE any fetch, so onboarding data
// never reaches the client payload for visitors who haven't unlocked the tab.
async function OnboardingContent() {
  if (!(await hasOnboardingAccess())) {
    return <PasswordGate />;
  }

  const [weekly, summary] = await Promise.all([
    getOnboardingWeeklyStats(),
    getOnboardingSummaryStats(),
  ]);

  return (
    <>
      <OnboardingWeeklySection
        initialData={weekly}
        headerAction={isGateDisabled() ? undefined : <LockButton />}
      />
      <OnboardingSummarySection data={summary} />
    </>
  );
}

async function ApiUsageContent() {
  const data = await getApiUsageStats();
  return <ApiUsageSection data={data} />;
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

  const productContent = (
    <>
      <Suspense fallback={<LoadingState />}>
        <ProductWacSection />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        <ProductFunnelSection />
      </Suspense>
    </>
  );

  const onboardingContent = (
    <Suspense fallback={<LoadingState />}>
      <OnboardingContent />
    </Suspense>
  );

  const apiContent = (
    <Suspense fallback={<LoadingState />}>
      <ApiUsageContent />
    </Suspense>
  );

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
        productContent={productContent}
        onboardingContent={onboardingContent}
        apiContent={apiContent}
        ufoContent={ufoContent}
        dbContent={dbContent}
        lastUpdated={lastUpdated}
      />
    </main>
  );
}
