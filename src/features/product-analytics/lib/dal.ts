import type { WacStatsDTO, ActivationFunnelStatsDTO } from "../types";

// Pure async data access for the product analytics endpoints.
// No React, no caching — see page.tsx for "use cache" wrappers.
export class ProductAnalyticsClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_SEMBLE_API_BASE;
    const apiKey = process.env.STATS_API_KEY;

    if (!baseUrl) {
      throw new Error(
        "NEXT_PUBLIC_SEMBLE_API_BASE environment variable is required",
      );
    }
    if (!apiKey) {
      throw new Error("STATS_API_KEY environment variable is required");
    }

    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Product analytics API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  // Shared params: endWeek? (ISO date), weeks? (0/omitted => all-time).
  private query(endWeek?: string, weeks?: number): string {
    const params = new URLSearchParams();
    if (endWeek) params.set("endWeek", endWeek);
    if (weeks !== undefined) params.set("weeks", String(weeks));
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }

  // GET /api/stats/wac — Weekly Active Curators (gap-filled weekly series).
  async getWac(endWeek?: string, weeks?: number): Promise<WacStatsDTO> {
    return this.fetch<WacStatsDTO>(
      `/api/stats/wac${this.query(endWeek, weeks)}`,
    );
  }

  // GET /api/stats/activation-funnel — weekly signup-cohort activation funnel.
  async getActivationFunnel(
    endWeek?: string,
    weeks?: number,
  ): Promise<ActivationFunnelStatsDTO> {
    return this.fetch<ActivationFunnelStatsDTO>(
      `/api/stats/activation-funnel${this.query(endWeek, weeks)}`,
    );
  }
}
