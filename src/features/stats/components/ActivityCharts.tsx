import { AreaChart, BarChart, LineChart } from "@mantine/charts";
import { Grid, GridCol, Group, Paper, Stack, Text } from "@mantine/core";
import type { DailyMetrics } from "../types";

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

export function DailyActiveUsersChart({ dau, wau, mau }: ActivityChartsProps) {
  // Prepare data for nested bar chart showing DAU ⊆ WAU ⊆ MAU
  const chartData = [
    {
      metric: "Active Users",
      MAU: mau ?? 0,
      WAU: wau ?? 0,
      DAU: dau ?? 0,
    },
  ];

  return (
    <Paper p="md" radius="lg" withBorder>
      <Stack gap="md">
        <Text size="sm" fw={600} c="dimmed" tt="uppercase">
          Active Users
        </Text>

        {(dau !== undefined || wau !== undefined || mau !== undefined) && (
          <>
            <Grid>
              {dau !== undefined && (
                <GridCol span={{ base: 12, sm: 4 }}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Today (DAU)
                    </Text>
                    <Text size="xl" fw={700}>
                      {dau.toLocaleString()}
                    </Text>
                    {mau !== undefined && mau > 0 && (
                      <Text size="xs" c="dimmed">
                        {((dau / mau) * 100).toFixed(1)}% of MAU
                      </Text>
                    )}
                  </Stack>
                </GridCol>
              )}
              {wau !== undefined && (
                <GridCol span={{ base: 12, sm: 4 }}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Last 7 Days (WAU)
                    </Text>
                    <Text size="xl" fw={700}>
                      {wau.toLocaleString()}
                    </Text>
                    {mau !== undefined && mau > 0 && (
                      <Text size="xs" c="dimmed">
                        {((wau / mau) * 100).toFixed(1)}% of MAU
                      </Text>
                    )}
                  </Stack>
                </GridCol>
              )}
              {mau !== undefined && (
                <GridCol span={{ base: 12, sm: 4 }}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Last 30 Days (MAU)
                    </Text>
                    <Text size="xl" fw={700}>
                      {mau.toLocaleString()}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Total active users
                    </Text>
                  </Stack>
                </GridCol>
              )}
            </Grid>

            <BarChart
              h={180}
              data={chartData}
              dataKey="metric"
              series={[
                { name: "MAU", color: "blue.3", label: "Last 30 Days (MAU)" },
                { name: "WAU", color: "cyan.6", label: "Last 7 Days (WAU)" },
                { name: "DAU", color: "teal.6", label: "Active Today (DAU)" },
              ]}
              orientation="horizontal"
              yAxisProps={{ width: 100 }}
              withLegend
              legendProps={{ verticalAlign: "bottom", height: 50 }}
            />
          </>
        )}
      </Stack>
    </Paper>
  );
}

export function TotalUsersGrowthChart({
  dailyActivity,
  totalUsers,
}: TotalUsersGrowthChartProps) {
  // Estimate cumulative user growth by distributing the all-time total
  // proportionally across daily active user counts — this is an approximation,
  // not real registration data.
  const totalActivity = dailyActivity.reduce(
    (sum, day) => sum + day.activeUsers,
    0,
  );

  const chartData = dailyActivity.reduce<
    Array<{
      date: string;
      totalUsers: number;
      activeUsers: number;
    }>
  >((acc, day) => {
    const accumulatedActivity =
      acc.length > 0
        ? (acc[acc.length - 1].totalUsers * totalActivity) / totalUsers +
          day.activeUsers
        : day.activeUsers;

    // Estimate cumulative users as a proportion of total users based on accumulated activity
    const estimatedCumulative = Math.round(
      (accumulatedActivity / totalActivity) * totalUsers,
    );

    acc.push({
      date: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      totalUsers: estimatedCumulative,
      activeUsers: day.activeUsers,
    });

    return acc;
  }, []);

  return (
    <Paper p="md" radius="lg" withBorder>
      <Stack gap="md">
        <div>
          <Text size="sm" fw={600} c="dimmed" tt="uppercase">
            Total Users (Estimate)
          </Text>
          <Text size="xl" fw={700} mt="xs">
            {totalUsers.toLocaleString()}
          </Text>
          <Text size="xs" c="dimmed">
            All time · chart shows estimated cumulative growth
          </Text>
        </div>
        <LineChart
          withLegend
          h={250}
          data={chartData}
          dataKey="date"
          series={[
            {
              name: "totalUsers",
              color: "teal.6",
              label: "Est. Cumulative Users",
            },
            { name: "activeUsers", color: "blue.6", label: "Active Users" },
          ]}
          curveType="monotone"
          withDots={false}
          yAxisProps={{ allowDecimals: false }}
        />
      </Stack>
    </Paper>
  );
}

export function RecordsCreatedChart({ dailyActivity }: ActivityChartsProps) {
  const chartData = dailyActivity.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    cards: day.cards.created,
    collections: day.collections.created,
    follows: day.follows.created,
  }));

  return (
    <Paper p="md" radius="lg" withBorder>
      <Stack gap="md">
        <Text size="sm" fw={600} c="dimmed" tt="uppercase">
          Records Created (30 Days)
        </Text>
        <AreaChart
          withLegend
          h={250}
          data={chartData}
          dataKey="date"
          series={[
            { name: "cards", color: "cyan.6", label: "Cards" },
            { name: "collections", color: "violet.6", label: "Collections" },
            { name: "follows", color: "orange.6", label: "Follows" },
          ]}
          curveType="monotone"
          withDots={false}
          yAxisProps={{ allowDecimals: false }}
          fillOpacity={0.4}
        />
      </Stack>
    </Paper>
  );
}

export function CombinedActivityChart({ dailyActivity }: ActivityChartsProps) {
  const chartData = dailyActivity.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    users: day.activeUsers,
    cards: day.cards.created,
    collections: day.collections.created,
    follows: day.follows.created,
    total: day.cards.created + day.collections.created + day.follows.created,
  }));

  return (
    <Paper p="md" radius="lg" withBorder>
      <Stack gap="md">
        <Text size="sm" fw={600} c="dimmed" tt="uppercase">
          Activity Overview (30 Days)
        </Text>
        <AreaChart
          withLegend
          h={300}
          data={chartData}
          dataKey="date"
          series={[
            { name: "users", color: "blue", label: "Active Users" },
            { name: "cards", color: "cyan", label: "Cards Created" },
            {
              name: "collections",
              color: "violet",
              label: "Collections Created",
            },
            { name: "follows", color: "orange", label: "Follows Created" },
          ]}
          curveType="monotone"
          withDots={false}
          yAxisProps={{ allowDecimals: false }}
        />
      </Stack>
    </Paper>
  );
}

export function TotalRecordsBarChart({
  totalCreated,
  totalDeleted,
  totalActive,
}: TotalRecordsBarChartProps) {
  const chartData = [
    {
      category: "Records",
      Created: totalCreated,
      Deleted: totalDeleted,
    },
  ];

  return (
    <Paper p="md" radius="lg" withBorder>
      <Stack gap="md">
        <div>
          <Text size="sm" fw={600} c="dimmed" tt="uppercase">
            Total Records
          </Text>
          <Group gap={"xl"}>
            <Stack gap={0}>
              <Text size="xl" fw={700} mt="xs">
                {totalActive.toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed">
                Active
              </Text>
            </Stack>
            <Stack gap={0}>
              <Text size="xl" fw={700} mt="xs">
                {totalCreated.toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed">
                Created
              </Text>
            </Stack>
            <Stack gap={0}>
              <Text size="xl" fw={700} mt="xs">
                {totalDeleted.toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed">
                Deleted
              </Text>
            </Stack>
          </Group>
        </div>
        <BarChart
          withLegend
          h={120}
          data={chartData}
          dataKey="category"
          series={[
            { name: "Created", color: "teal.6", label: "Created" },
            { name: "Deleted", color: "red.6", label: "Deleted" },
          ]}
          orientation="vertical"
          type="stacked"
          yAxisProps={{ width: 65 }}
        />
      </Stack>
    </Paper>
  );
}
