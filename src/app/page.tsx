import Header from "@/features/navigation/components/header/Header";
import { SembleAnalytics } from "@/features/stats/lib/analytics";
import {
  CombinedActivityChart,
  DailyActiveUsersChart,
  RecordsCreatedChart,
  TotalRecordsBarChart,
  TotalUsersGrowthChart,
} from "@/features/stats/components/ActivityCharts";
import {
  Container,
  Grid,
  GridCol,
  Paper,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from "@mantine/core";
import { Suspense } from "react";

// Cached data fetching functions
async function getOverallAnalytics() {
  "use cache";
  const analytics = new SembleAnalytics();
  return analytics.getAnalytics();
}

async function getActiveUserMetrics() {
  "use cache";
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
  const analytics = new SembleAnalytics();
  const now = new Date();
  const startDate = new Date("2025-11-03T00:00:00Z");

  return analytics.getDailyActiveUsers(
    startDate.toISOString(),
    now.toISOString(),
  );
}

// Component sections
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

async function OverallStatsSection() {
  const [overallStats, historicalActivity] = await Promise.all([
    getOverallAnalytics(),
    getHistoricalDailyActivity(),
  ]);

  return (
    <Stack gap="md">
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
    </Stack>
  );
}

async function RecordsByTypeSection() {
  const [overallStats, dailyActivity] = await Promise.all([
    getOverallAnalytics(),
    getDailyActivity(),
  ]);

  const recentActivity = dailyActivity.slice(-7);
  const recentCardsCreated = recentActivity.reduce(
    (sum, day) => sum + day.cards.created,
    0,
  );
  const recentCollectionsCreated = recentActivity.reduce(
    (sum, day) => sum + day.collections.created,
    0,
  );
  const recentFollowsCreated = recentActivity.reduce(
    (sum, day) => sum + day.follows.created,
    0,
  );

  return (
    <Stack gap="md">
      <Title order={2} size="h3">
        Records by Type
      </Title>
      <Grid>
        <GridCol span={{ base: 12, md: 6 }}>
          <Paper p="md" radius={"lg"} withBorder>
            <Stack gap="md">
              <Text size="lg" fw={600}>
                Cards
              </Text>
              <Grid>
                <GridCol span={6}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Active
                    </Text>
                    <Text size="lg" fw={700}>
                      {overallStats.recordsByType.cards.active.toLocaleString()}
                    </Text>
                  </Stack>
                </GridCol>
                <GridCol span={6}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Created (7d)
                    </Text>
                    <Text size="lg" fw={700}>
                      {recentCardsCreated.toLocaleString()}
                    </Text>
                  </Stack>
                </GridCol>
                <GridCol span={6}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed">
                      All-time created
                    </Text>
                    <Text size="sm">
                      {overallStats.recordsByType.cards.created.toLocaleString()}
                    </Text>
                  </Stack>
                </GridCol>
                <GridCol span={6}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed">
                      All-time updated
                    </Text>
                    <Text size="sm">
                      {overallStats.recordsByType.cards.updated.toLocaleString()}
                    </Text>
                  </Stack>
                </GridCol>
              </Grid>
            </Stack>
          </Paper>
        </GridCol>

        <GridCol span={{ base: 12, md: 6 }}>
          <Paper p="md" radius={"lg"} withBorder>
            <Stack gap="md">
              <Text size="lg" fw={600}>
                Collections
              </Text>
              <Grid>
                <GridCol span={6}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Active
                    </Text>
                    <Text size="lg" fw={700}>
                      {overallStats.recordsByType.collections.active.toLocaleString()}
                    </Text>
                  </Stack>
                </GridCol>
                <GridCol span={6}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Created (7d)
                    </Text>
                    <Text size="lg" fw={700}>
                      {recentCollectionsCreated.toLocaleString()}
                    </Text>
                  </Stack>
                </GridCol>
                <GridCol span={6}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed">
                      All-time created
                    </Text>
                    <Text size="sm">
                      {overallStats.recordsByType.collections.created.toLocaleString()}
                    </Text>
                  </Stack>
                </GridCol>
                <GridCol span={6}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed">
                      All-time updated
                    </Text>
                    <Text size="sm">
                      {overallStats.recordsByType.collections.updated.toLocaleString()}
                    </Text>
                  </Stack>
                </GridCol>
              </Grid>
            </Stack>
          </Paper>
        </GridCol>

        <GridCol span={{ base: 12, md: 6 }}>
          <Paper p="md" radius={"lg"} withBorder>
            <Stack gap="md">
              <Text size="lg" fw={600}>
                Follows
              </Text>
              <Grid>
                <GridCol span={6}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Active
                    </Text>
                    <Text size="lg" fw={700}>
                      {overallStats.recordsByType.follows.active.toLocaleString()}
                    </Text>
                  </Stack>
                </GridCol>
                <GridCol span={6}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Created (7d)
                    </Text>
                    <Text size="lg" fw={700}>
                      {recentFollowsCreated.toLocaleString()}
                    </Text>
                  </Stack>
                </GridCol>
                <GridCol span={6}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed">
                      All-time created
                    </Text>
                    <Text size="sm">
                      {overallStats.recordsByType.follows.created.toLocaleString()}
                    </Text>
                  </Stack>
                </GridCol>
                <GridCol span={6}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed">
                      All-time updated
                    </Text>
                    <Text size="sm">
                      {overallStats.recordsByType.follows.updated.toLocaleString()}
                    </Text>
                  </Stack>
                </GridCol>
              </Grid>
            </Stack>
          </Paper>
        </GridCol>
      </Grid>

      <RecordsCreatedChart dailyActivity={dailyActivity} />
    </Stack>
  );
}

async function RecentActivitySection() {
  const [dailyActivity, yearlyActivity] = await Promise.all([
    getDailyActivity(),
    getYearlyDailyActivity(),
  ]);
  const recentActivity = dailyActivity.slice(-7);

  return (
    <Stack gap="md">
      <Title order={2} size="h3">
        Activity Overview
      </Title>

      <CombinedActivityChart dailyActivity={yearlyActivity} />

      <Stack gap={0}>
        <Title order={3} size="h4">
          Recent Activity (Last 7 Days)
        </Title>
        <Text size="xs" c="dimmed" mb="xs">
          Numbers in parentheses indicate updated records
        </Text>
      </Stack>
      <Paper radius={"lg"} withBorder>
        <Table>
          <TableThead>
            <TableTr>
              <TableTh>Date</TableTh>
              <TableTh>Active Users</TableTh>
              <TableTh>Cards Created</TableTh>
              <TableTh>Collections Created</TableTh>
              <TableTh>Follows Created</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {recentActivity.map((day) => (
              <TableTr key={day.date}>
                <TableTd>
                  <Text size="sm">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </TableTd>
                <TableTd>
                  <Text size="sm" fw={600}>
                    {day.activeUsers}
                  </Text>
                </TableTd>
                <TableTd>
                  <Text size="sm">
                    +{day.cards.created}
                    {day.cards.updated > 0 && (
                      <Text span size="xs" c="dimmed">
                        {" "}
                        ({day.cards.updated})
                      </Text>
                    )}
                  </Text>
                </TableTd>
                <TableTd>
                  <Text size="sm">
                    +{day.collections.created}
                    {day.collections.updated > 0 && (
                      <Text span size="xs" c="dimmed">
                        {" "}
                        ({day.collections.updated})
                      </Text>
                    )}
                  </Text>
                </TableTd>
                <TableTd>
                  <Text size="sm">
                    +{day.follows.created}
                    {day.follows.updated > 0 && (
                      <Text span size="xs" c="dimmed">
                        {" "}
                        ({day.follows.updated})
                      </Text>
                    )}
                  </Text>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </Paper>
    </Stack>
  );
}

function LoadingState() {
  return (
    <Paper p="md" radius={"lg"} withBorder>
      <Text c="dimmed">Loading...</Text>
    </Paper>
  );
}

export default async function Home() {
  return (
    <Container size="lg" p="sm">
      <Stack gap="xl">
        <Header />

        <Suspense fallback={<LoadingState />}>
          <ActiveUsersSection />
        </Suspense>

        <Suspense fallback={<LoadingState />}>
          <OverallStatsSection />
        </Suspense>

        <Suspense fallback={<LoadingState />}>
          <RecordsByTypeSection />
        </Suspense>

        <Suspense fallback={<LoadingState />}>
          <RecentActivitySection />
        </Suspense>
      </Stack>
    </Container>
  );
}
