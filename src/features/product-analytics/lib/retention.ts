// Client-side derivations over the retention DTOs.

import type { RetentionDataPoint } from "../types";

export type RetentionMetric = "activeUsers" | "curatingUsers";

/**
 * Retention rate (0..1) for one cohort at a given week offset, or null when
 * the cohort hasn't reached that offset yet (or is empty).
 */
export function cohortRate(
  cohort: RetentionDataPoint,
  offset: number,
  metric: RetentionMetric,
): number | null {
  if (cohort.cohortSize <= 0) return null;
  const wk = cohort.weeks.find((w) => w.weekOffset === offset);
  if (!wk) return null;
  return wk[metric] / cohort.cohortSize;
}

/**
 * Pooled retention rate at `offset` over the most recent `windowSize` cohorts
 * that have reached that offset, skipping `skip` such cohorts from the end
 * (skip=windowSize => the prior window, for deltas). Sums users over sizes so
 * bigger cohorts weigh more. Null when no cohort qualifies.
 */
export function pooledRate(
  cohorts: RetentionDataPoint[],
  offset: number,
  metric: RetentionMetric,
  windowSize: number,
  skip = 0,
): { rate: number; cohorts: number } | null {
  let users = 0;
  let size = 0;
  let taken = 0;
  let skipped = 0;
  for (let i = cohorts.length - 1; i >= 0 && taken < windowSize; i--) {
    const c = cohorts[i];
    const wk = c.weeks.find((w) => w.weekOffset === offset);
    if (!wk || c.cohortSize <= 0) continue;
    if (skipped < skip) {
      skipped++;
      continue;
    }
    users += wk[metric];
    size += c.cohortSize;
    taken++;
  }
  if (taken === 0 || size === 0) return null;
  return { rate: users / size, cohorts: taken };
}

/**
 * Trailing rolling average over a (nullable) series; null inputs are skipped,
 * output is null until at least one value is in the window.
 */
export function rollingAverage(
  values: Array<number | null>,
  window: number,
): Array<number | null> {
  return values.map((_, i) => {
    const slice = values
      .slice(Math.max(0, i - window + 1), i + 1)
      .filter((v): v is number => v !== null);
    if (slice.length === 0) return null;
    return slice.reduce((s, v) => s + v, 0) / slice.length;
  });
}
