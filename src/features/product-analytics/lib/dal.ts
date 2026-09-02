import type {
  WacStatsDTO,
  ActivationFunnelStatsDTO,
  RetentionStatsDTO,
  RetentionSegmentBy,
  RetentionSegmentsStatsDTO,
} from "../types";
import {
  mockActivationFunnelStats,
  mockRetentionSegmentsStats,
  mockRetentionStats,
  mockWacStats,
} from "./mock";

// PRODUCT_ANALYTICS_MOCK=true serves local fixtures instead of the real API.
const USE_MOCK = process.env.PRODUCT_ANALYTICS_MOCK === "true";

// Pure async data access for the product analytics endpoints.
// No React, no caching — see page.tsx for "use cache" wrappers.
export class ProductAnalyticsClient {
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
  private query(
    endWeek?: string,
    weeks?: number,
    extra?: Record<string, string>,
  ): string {
    const params = new URLSearchParams();
    if (endWeek) params.set("endWeek", endWeek);
    if (weeks !== undefined) params.set("weeks", String(weeks));
    for (const [k, v] of Object.entries(extra ?? {})) params.set(k, v);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }

  // GET /api/stats/wac — Weekly Active Curators (gap-filled weekly series).
  async getWac(endWeek?: string, weeks?: number): Promise<WacStatsDTO> {
    if (USE_MOCK) return mockWacStats();
    return this.fetch<WacStatsDTO>(
      `/api/stats/wac${this.query(endWeek, weeks)}`,
    );
  }

  // GET /api/stats/activation-funnel — weekly signup-cohort activation funnel.
  async getActivationFunnel(
    endWeek?: string,
    weeks?: number,
  ): Promise<ActivationFunnelStatsDTO> {
    if (USE_MOCK) return mockActivationFunnelStats();
    return this.fetch<ActivationFunnelStatsDTO>(
      `/api/stats/activation-funnel${this.query(endWeek, weeks)}`,
    );
  }

  // GET /api/stats/retention — weekly signup-cohort retention triangle.
  async getRetention(
    endWeek?: string,
    weeks?: number,
  ): Promise<RetentionStatsDTO> {
    if (USE_MOCK) return mockRetentionStats();
    return this.fetch<RetentionStatsDTO>(
      `/api/stats/retention${this.query(endWeek, weeks)}`,
    );
  }

  // GET /api/stats/retention/segments — pooled retention split by attribute.
  async getRetentionSegments(
    segmentBy: RetentionSegmentBy,
    endWeek?: string,
    weeks?: number,
  ): Promise<RetentionSegmentsStatsDTO> {
    if (USE_MOCK) return mockRetentionSegmentsStats(segmentBy);
    return this.fetch<RetentionSegmentsStatsDTO>(
      `/api/stats/retention/segments${this.query(endWeek, weeks, { segmentBy })}`,
    );
  }
}
