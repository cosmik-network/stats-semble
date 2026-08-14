import type {
  OnboardingWeeklyStatsDTO,
  OnboardingSummaryStatsDTO,
} from "../types";
import { mockSummaryStats, mockWeeklyStats } from "./mock";

// The onboarding endpoints aren't deployed yet, so ONBOARDING_ANALYTICS_MOCK=true
// serves local fixtures instead. Remove this (and lib/mock.ts) once they ship.
const USE_MOCK = process.env.ONBOARDING_ANALYTICS_MOCK === "true";

// Pure async data access for the onboarding stats endpoints.
// No React, no caching — see page.tsx / actions.ts for "use cache" wrappers.
export class OnboardingAnalyticsClient {
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
        `Onboarding analytics API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  // GET /api/stats/onboarding/weekly — one signup cohort week, hydrated.
  // endWeek omitted => most recent COMPLETED week.
  async getWeekly(endWeek?: string): Promise<OnboardingWeeklyStatsDTO> {
    if (USE_MOCK) return mockWeeklyStats(endWeek);

    const qs = endWeek
      ? `?${new URLSearchParams({ endWeek }).toString()}`
      : "";
    return this.fetch<OnboardingWeeklyStatsDTO>(
      `/api/stats/onboarding/weekly${qs}`,
    );
  }

  // GET /api/stats/onboarding/summary — all-time (since launch) totals.
  async getSummary(): Promise<OnboardingSummaryStatsDTO> {
    if (USE_MOCK) return mockSummaryStats();

    return this.fetch<OnboardingSummaryStatsDTO>(
      "/api/stats/onboarding/summary",
    );
  }
}
