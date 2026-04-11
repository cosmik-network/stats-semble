import { BarChart } from "@mantine/charts";
import { Grid, GridCol, Paper, Stack, Text } from "@mantine/core";
import type { EngagementStats } from "../types/stats";

interface EngagementOverviewChartProps {
  data: EngagementStats;
}

export function EngagementOverviewChart({
  data,
}: EngagementOverviewChartProps) {
  const chartData = [
    {
      category: "User Status",
      Active: data.activeUsers,
      Inactive: data.inactiveUsers,
    },
  ];

  const activityBreakdown = [
    {
      category: "Activity Types",
      Cards: data.usersWithCards,
      Collections: data.usersWithCollections,
      Connections: data.usersWithConnections,
      Follows: data.usersWithFollows,
      Contributions: data.usersWithContributions,
    },
  ];

  return (
    <Paper p="md" radius="lg" withBorder>
      <Stack gap="md">
        <div>
          <Text size="sm" fw={600} c="dimmed" tt="uppercase">
            User Engagement
          </Text>
          <Text size="xl" fw={700} mt="xs">
            {(data.activationRate * 100).toFixed(1)}%
          </Text>
          <Text size="xs" c="dimmed">
            Activation rate
          </Text>
        </div>

        <Grid>
          <GridCol span={{ base: 12, sm: 4 }}>
            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase">
                Total Users
              </Text>
              <Text size="lg" fw={700}>
                {data.totalUsers.toLocaleString()}
              </Text>
            </Stack>
          </GridCol>
          <GridCol span={{ base: 12, sm: 4 }}>
            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase">
                Active Users
              </Text>
              <Text size="lg" fw={700} c="teal.6">
                {data.activeUsers.toLocaleString()}
              </Text>
            </Stack>
          </GridCol>
          <GridCol span={{ base: 12, sm: 4 }}>
            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase">
                Avg Actions/User
              </Text>
              <Text size="lg" fw={700}>
                {data.avgActionsPerActiveUser.toFixed(1)}
              </Text>
            </Stack>
          </GridCol>
        </Grid>

        <BarChart
          withLegend
          h={120}
          data={chartData}
          dataKey="category"
          series={[
            { name: "Active", color: "teal.6", label: "Active" },
            { name: "Inactive", color: "gray.5", label: "Inactive" },
          ]}
          orientation="horizontal"
          type="stacked"
          yAxisProps={{ width: 100 }}
        />

        <Text size="xs" fw={600} c="dimmed" tt="uppercase" mt="md">
          Activity Breakdown
        </Text>
        <BarChart
          withLegend
          h={140}
          data={activityBreakdown}
          dataKey="category"
          series={[
            { name: "Cards", color: "cyan.6", label: "Cards" },
            { name: "Collections", color: "violet.6", label: "Collections" },
            { name: "Connections", color: "pink.6", label: "Connections" },
            { name: "Follows", color: "orange.6", label: "Follows" },
            {
              name: "Contributions",
              color: "indigo.6",
              label: "Contributions",
            },
          ]}
          orientation="horizontal"
          yAxisProps={{ width: 100 }}
        />
      </Stack>
    </Paper>
  );
}
