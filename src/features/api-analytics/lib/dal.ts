import type { ApiUsageStatsDTO } from "../types";
import { mockApiUsageStats } from "./mock";

// API_ANALYTICS_MOCK=true serves local fixtures instead of the real endpoint.
const USE_MOCK = process.env.API_ANALYTICS_MOCK === "true";

// Pure async data access for the API usage analytics endpoint.
// No React, no caching — see page.tsx for "use cache" wrappers.
export class ApiAnalyticsClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_SEMBLE_API_BASE;
    const apiKey = process.env.STATS_API_KEY;

    // Mock mode talks to no API, so the credentials aren't required.
    if (!baseUrl && !USE_MOCK) {
      throw new Error(
        "NEXT_PUBLIC_SEMBLE_API_BASE environment variable is required",
      );
    }
    if (!apiKey && !USE_MOCK) {
      throw new Error("STATS_API_KEY environment variable is required");
    }

    this.baseUrl = baseUrl ?? "";
    this.apiKey = apiKey ?? "";
  }

  // GET /api/stats/api-usage — non-webapp API usage per client source.
  // Shared params: endWeek? (ISO date), weeks? (0/omitted => all-time).
  async getApiUsage(
    endWeek?: string,
    weeks?: number,
  ): Promise<ApiUsageStatsDTO> {
    if (USE_MOCK) return mockApiUsageStats();

    const params = new URLSearchParams();
    if (endWeek) params.set("endWeek", endWeek);
    if (weeks !== undefined) params.set("weeks", String(weeks));
    const qs = params.toString();
    const url = `${this.baseUrl}/api/stats/api-usage${qs ? `?${qs}` : ""}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `API usage stats error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
}
