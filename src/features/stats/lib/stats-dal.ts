import type {
  GrowthStats,
  EngagementStats,
  ActivityStats,
  BreakdownStats,
  IntervalType,
} from "../types/stats";

export class StatsClient {
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
        `Stats API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  async getGrowth(
    interval: IntervalType = "day",
    limit: number = 30,
  ): Promise<GrowthStats> {
    return this.fetch<GrowthStats>(
      `/api/stats?type=growth&interval=${interval}&limit=${limit}`,
    );
  }

  async getEngagement(
    includeTimeSeries: boolean = false,
    interval?: IntervalType,
    limit?: number,
  ): Promise<EngagementStats> {
    let endpoint = "/api/stats?type=engagement";
    if (includeTimeSeries) {
      endpoint += `&includeTimeSeries=true&interval=${interval || "day"}&limit=${limit || 30}`;
    }
    return this.fetch<EngagementStats>(endpoint);
  }

  async getActivity(
    interval: IntervalType = "day",
    limit: number = 30,
  ): Promise<ActivityStats> {
    return this.fetch<ActivityStats>(
      `/api/stats?type=activity&interval=${interval}&limit=${limit}`,
    );
  }

  async getBreakdown(
    interval: IntervalType = "day",
    limit: number = 30,
  ): Promise<BreakdownStats> {
    return this.fetch<BreakdownStats>(
      `/api/stats?type=breakdown&interval=${interval}&limit=${limit}`,
    );
  }
}
