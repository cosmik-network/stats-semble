import { AreaChart } from "@mantine/charts";
import { Grid, GridCol, Paper, Stack, Text } from "@mantine/core";
import type { ActivityStats } from "../types/stats";

interface ActivityChartProps {
  data: ActivityStats;
}

export function ActivityChart({ data }: ActivityChartProps) {
  const chartData = data.dataPoints.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    cards: point.cardsCreated,
    collections: point.collectionsCreated,
    connections: point.connectionsCreated,
    follows: point.followsCreated,
  }));

  return (
    <Paper p="md" radius="lg" withBorder>
      <Stack gap="md">
        <div>
          <Text size="sm" fw={600} c="dimmed" tt="uppercase">
            Content Activity
          </Text>
          <Text size="xl" fw={700} mt="xs">
            {data.totals.totalActions.toLocaleString()}
          </Text>
          <Text size="xs" c="dimmed">
            Total actions in period
          </Text>
        </div>

        <Grid>
          <GridCol span={{ base: 6, sm: 3 }}>
            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase">
                Cards
              </Text>
              <Text size="lg" fw={700}>
                {data.totals.cardsCreated.toLocaleString()}
              </Text>
            </Stack>
          </GridCol>
          <GridCol span={{ base: 6, sm: 3 }}>
            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase">
                Collections
              </Text>
              <Text size="lg" fw={700}>
                {data.totals.collectionsCreated.toLocaleString()}
              </Text>
            </Stack>
          </GridCol>
          <GridCol span={{ base: 6, sm: 3 }}>
            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase">
                Connections
              </Text>
              <Text size="lg" fw={700}>
                {data.totals.connectionsCreated.toLocaleString()}
              </Text>
            </Stack>
          </GridCol>
          <GridCol span={{ base: 6, sm: 3 }}>
            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase">
                Follows
              </Text>
              <Text size="lg" fw={700}>
                {data.totals.followsCreated.toLocaleString()}
              </Text>
            </Stack>
          </GridCol>
        </Grid>

        <AreaChart
          withLegend
          h={250}
          data={chartData}
          dataKey="date"
          series={[
            { name: "cards", color: "cyan.6", label: "Cards" },
            { name: "collections", color: "violet.6", label: "Collections" },
            { name: "connections", color: "pink.6", label: "Connections" },
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
