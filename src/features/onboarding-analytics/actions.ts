"use server";

import { revalidatePath } from "next/cache";
import { OnboardingAnalyticsClient } from "./lib/dal";
import {
  grantOnboardingAccess,
  hasOnboardingAccess,
  revokeOnboardingAccess,
} from "./lib/auth";
import type { OnboardingWeeklyStatsDTO } from "./types";

// The weekly endpoint returns one cohort week per call, so week navigation
// fetches on demand rather than paging a preloaded series (as WAC does).
// Kept server-side so the stats API key never reaches the client.
export async function fetchOnboardingWeek(
  endWeek: string,
): Promise<OnboardingWeeklyStatsDTO> {
  // Server Actions are independently callable, so this re-checks access rather
  // than trusting that the caller rendered behind the gate.
  if (!(await hasOnboardingAccess())) {
    throw new Error("Not authorized");
  }

  const client = new OnboardingAnalyticsClient();
  return client.getWeekly(endWeek);
}

export interface UnlockResult {
  ok: boolean;
  error?: string;
}

/** Check a submitted password and set the access cookie when it matches. */
export async function unlockOnboarding(
  _prev: UnlockResult | undefined,
  formData: FormData,
): Promise<UnlockResult> {
  const submitted = formData.get("password");
  if (typeof submitted !== "string" || submitted.length === 0) {
    return { ok: false, error: "enter a password" };
  }

  if (!(await grantOnboardingAccess(submitted))) {
    return { ok: false, error: "incorrect password" };
  }

  // Re-render so the gated content is fetched and streamed in.
  revalidatePath("/");
  return { ok: true };
}

export async function lockOnboarding(): Promise<void> {
  await revokeOnboardingAccess();
  revalidatePath("/");
}
