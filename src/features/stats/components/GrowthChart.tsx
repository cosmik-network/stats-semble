import { LineChart } from "@mantine/charts";
import { Paper, Stack, Text } from "@mantine/core";
import type { GrowthStats } from "../types/stats";

interface GrowthChartProps {
  data: GrowthStats;
}

export function GrowthChart({ data }: GrowthChartProps) {
  const chartData = data.dataPoints.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    totalUsers: point.totalUsers,
    newUsers: point.newUsers,
  }));

  return (
    <Paper p="md" radius="lg" withBorder>
      <Stack gap="md">
        <div>
          <Text size="sm" fw={600} c="dimmed" tt="uppercase">
            User Growth
          </Text>
          <Text size="xl" fw={700} mt="xs">
            {data.currentTotal.toLocaleString()}
          </Text>
          <Text size="xs" c="dimmed">
            Total users
          </Text>
        </div>
        <LineChart
          withLegend
          h={250}
          data={chartData}
          dataKey="date"
          series={[
            { name: "totalUsers", color: "teal.6", label: "Total Users" },
            { name: "newUsers", color: "blue.6", label: "New Users" },
          ]}
          curveType="monotone"
          withDots={false}
          yAxisProps={{ allowDecimals: false }}
        />
      </Stack>
    </Paper>
  );
}
