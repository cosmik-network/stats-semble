import { BarChart } from "@mantine/charts";
import { Grid, GridCol, Paper, Stack, Text } from "@mantine/core";
import type { BreakdownStats } from "../types/stats";

interface BreakdownChartsProps {
  data: BreakdownStats;
}

export function BreakdownCharts({ data }: BreakdownChartsProps) {
  const urlCardData = Object.entries(data.currentTotals.urlCards.byType).map(
    ([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
    }),
  );

  const collectionData = Object.entries(
    data.currentTotals.collections.byAccessType,
  ).map(([type, count]) => ({
    type,
    count,
  }));

  const connectionData = Object.entries(
    data.currentTotals.connections.byType,
  ).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
  }));

  return (
    <Grid>
      <GridCol span={{ base: 12, md: 4 }}>
        <Paper p="md" radius="lg" withBorder h="100%">
          <Stack gap="md">
            <div>
              <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                URL Cards by Type
              </Text>
              <Text size="xl" fw={700} mt="xs">
                {data.currentTotals.urlCards.total.toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed">
                Total URL cards
              </Text>
            </div>
            <BarChart
              h={200}
              data={urlCardData}
              dataKey="type"
              series={[{ name: "count", color: "cyan.6" }]}
              orientation="horizontal"
              yAxisProps={{ width: 80 }}
              withLegend={false}
            />
          </Stack>
        </Paper>
      </GridCol>

      <GridCol span={{ base: 12, md: 4 }}>
        <Paper p="md" radius="lg" withBorder h="100%">
          <Stack gap="md">
            <div>
              <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                Collections by Access
              </Text>
              <Text size="xl" fw={700} mt="xs">
                {data.currentTotals.collections.total.toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed">
                Total collections
              </Text>
            </div>
            <BarChart
              h={200}
              data={collectionData}
              dataKey="type"
              series={[{ name: "count", color: "violet.6" }]}
              orientation="horizontal"
              yAxisProps={{ width: 80 }}
              withLegend={false}
            />
          </Stack>
        </Paper>
      </GridCol>

      <GridCol span={{ base: 12, md: 4 }}>
        <Paper p="md" radius="lg" withBorder h="100%">
          <Stack gap="md">
            <div>
              <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                Connections by Type
              </Text>
              <Text size="xl" fw={700} mt="xs">
                {data.currentTotals.connections.total.toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed">
                Total connections
              </Text>
            </div>
            <BarChart
              h={200}
              data={connectionData}
              dataKey="type"
              series={[{ name: "count", color: "pink.6" }]}
              orientation="horizontal"
              yAxisProps={{ width: 80 }}
              withLegend={false}
            />
          </Stack>
        </Paper>
      </GridCol>
    </Grid>
  );
}
