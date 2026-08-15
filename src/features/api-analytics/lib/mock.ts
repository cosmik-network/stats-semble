// Mock API usage stats for local development / review.
//
// Enabled by setting API_ANALYTICS_MOCK=true. The DAL falls back to these when
// the flag is on. Remove the flag branch in dal.ts to always hit the real API.

import type {
  ApiUsageDataPoint,
  ApiUsageStatsDTO,
  ApiUsageTotal,
} from "../types";

const SOURCES = ["mcp", "extension", "api", "obsidian-plugin", "raycast"];

const ENDPOINTS: Array<{ method: string; endpoint: string }> = [
  { method: "GET", endpoint: "/xrpc/cards/:id" },
  { method: "POST", endpoint: "/xrpc/cards" },
  { method: "GET", endpoint: "/xrpc/collections" },
  { method: "POST", endpoint: "/xrpc/connections" },
  { method: "GET", endpoint: "/xrpc/search" },
];

/**
 * Deterministic pseudo-random in [0,1) — seeded so the mock is stable across
 * renders (no hydration mismatch, no churn between refreshes).
 */
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Monday (UTC) `weeksAgo` weeks before the current week, as an ISO date. */
function weekStart(weeksAgo: number): string {
  const d = new Date();
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday - weeksAgo * 7);
  return d.toISOString().slice(0, 10);
}

export function mockApiUsageStats(): ApiUsageStatsDTO {
  const weeks = 26;

  const dataPoints: ApiUsageDataPoint[] = Array.from(
    { length: weeks },
    (_, i) => {
      const w = weeks - 1 - i; // weeksAgo, oldest -> newest
      const sources = SOURCES.map((source, s) => {
        // Gentle upward trend, varied per source; later sources launch later.
        const launched = w < weeks - s * 4;
        const users = launched
          ? Math.floor(rand(w * 7 + s) * 8 + (weeks - w) * 0.3) + 1
          : 0;
        const calls = users * (Math.floor(rand(w * 13 + s) * 40) + 5);
        return { source, users, calls };
      })
        .filter((x) => x.users > 0)
        .sort((a, b) => b.calls - a.calls || a.source.localeCompare(b.source));
      return { weekStart: weekStart(w), sources };
    },
  );

  const totals: ApiUsageTotal[] = SOURCES.map((source, s) => {
    const perWeek = dataPoints.flatMap((p) =>
      p.sources.filter((x) => x.source === source),
    );
    const calls = perWeek.reduce((sum, x) => sum + x.calls, 0);
    const users = Math.max(...perWeek.map((x) => x.users), 0) + s * 3;
    return {
      source,
      users,
      calls,
      topEndpoints: ENDPOINTS.map((e, i) => ({
        ...e,
        calls: Math.floor(calls * rand(s * 31 + i) * 0.4),
        users: Math.floor(users * rand(s * 37 + i)),
      })).sort((a, b) => b.calls - a.calls),
    };
  })
    .filter((t) => t.calls > 0)
    .sort((a, b) => b.calls - a.calls);

  return {
    dataPoints,
    totals,
    periodStart: dataPoints[0]?.weekStart ?? weekStart(0),
    periodEnd: dataPoints[dataPoints.length - 1]?.weekStart ?? weekStart(0),
  };
}
