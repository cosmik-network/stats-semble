"use server";

import { OnboardingAnalyticsClient } from "./lib/dal";
import type { OnboardingWeeklyStatsDTO } from "./types";

// The weekly endpoint returns one cohort week per call, so week navigation
// fetches on demand rather than paging a preloaded series (as WAC does).
// Kept server-side so the stats API key never reaches the client.
export async function fetchOnboardingWeek(
  endWeek: string,
): Promise<OnboardingWeeklyStatsDTO> {
  const client = new OnboardingAnalyticsClient();
  return client.getWeekly(endWeek);
}
