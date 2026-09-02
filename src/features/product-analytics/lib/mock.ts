// Mock product analytics stats for local development / UI review.
//
// Enabled by setting PRODUCT_ANALYTICS_MOCK=true. The DAL serves these for ALL
// product analytics endpoints when the flag is on (so the tab works fully
// offline). Remove the flag branches in dal.ts to always hit the real API.

import type {
  ActivationFunnelDataPoint,
  ActivationFunnelStatsDTO,
  RetentionDataPoint,
  RetentionSegmentBy,
  RetentionSegmentDataPoint,
  RetentionSegmentsStatsDTO,
  RetentionStatsDTO,
  RetentionWeekPoint,
  WacDataPoint,
  WacStatsDTO,
} from "../types";

const WEEKS = 40; // cohort/series history length

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

function period<T>(dataPoints: T[], key: (p: T) => string) {
  return {
    periodStart: dataPoints.length > 0 ? key(dataPoints[0]) : weekStart(1),
    periodEnd:
      dataPoints.length > 0
        ? key(dataPoints[dataPoints.length - 1])
        : weekStart(1),
  };
}

function mockCohortSize(weeksAgo: number): number {
  // ~25 → ~50 signups/week with noise, gently growing toward the present.
  return Math.floor(25 + (WEEKS - weeksAgo) * 0.5 + rand(weeksAgo * 3) * 12);
}

/**
 * Base retention curve for a cohort: starts ~45% at W1 and decays toward a
 * ~12% floor. Cohorts in the most recent quarter retain better (simulates the
 * onboarding launch) so the trend charts have something to show.
 */
function baseRate(weeksAgo: number, offset: number): number {
  const recentBoost = weeksAgo < 10 ? 0.1 : 0;
  const start = 0.45 + recentBoost + (rand(weeksAgo * 17) - 0.5) * 0.1;
  const floor = 0.12 + recentBoost / 2;
  return floor + (start - floor) * Math.exp(-offset / 6);
}

export function mockWacStats(): WacStatsDTO {
  const dataPoints: WacDataPoint[] = Array.from({ length: WEEKS }, (_, i) => {
    const w = WEEKS - 1 - i; // weeksAgo, oldest -> newest
    const base = Math.floor(20 + (WEEKS - w) * 0.6 + rand(w * 5) * 10);
    const collectionAdd = Math.floor(base * (0.6 + rand(w * 7) * 0.2));
    const connection = Math.floor(base * (0.4 + rand(w * 11) * 0.2));
    return {
      weekStart: weekStart(w + 1),
      collectionOrConnection: base,
      collectionAdd,
      connection,
      othersCollectionAdd: Math.floor(
        collectionAdd * (0.25 + rand(w * 13) * 0.2),
      ),
    };
  });
  return { dataPoints, ...period(dataPoints, (p) => p.weekStart) };
}

export function mockActivationFunnelStats(): ActivationFunnelStatsDTO {
  const dataPoints: ActivationFunnelDataPoint[] = Array.from(
    { length: WEEKS },
    (_, i) => {
      const w = WEEKS - 1 - i;
      const signups = mockCohortSize(w);
      return {
        cohortWeekStart: weekStart(w + 1),
        signups,
        savedUrlCard7d: Math.floor(signups * (0.55 + rand(w * 19) * 0.2)),
        curated14d: Math.floor(signups * (0.35 + rand(w * 23) * 0.2)),
        notified30d: Math.floor(signups * (0.25 + rand(w * 29) * 0.2)),
      };
    },
  );
  return { dataPoints, ...period(dataPoints, (p) => p.cohortWeekStart) };
}

export function mockRetentionStats(): RetentionStatsDTO {
  const dataPoints: RetentionDataPoint[] = Array.from(
    { length: WEEKS },
    (_, i) => {
      const w = WEEKS - 1 - i; // cohort weeksAgo (1 = most recent completed)
      const weeksAgo = w + 1;
      const cohortSize = mockCohortSize(weeksAgo);
      // Offsets 1..N where N = completed weeks since the cohort week.
      const maxOffset = weeksAgo - 1;
      const weeks: RetentionWeekPoint[] = Array.from(
        { length: maxOffset },
        (_, o) => {
          const offset = o + 1;
          const rate = Math.max(
            0,
            baseRate(weeksAgo, offset) +
              (rand(weeksAgo * 31 + offset) - 0.5) * 0.08,
          );
          const activeUsers = Math.round(cohortSize * rate);
          return {
            weekOffset: offset,
            activeUsers,
            curatingUsers: Math.round(
              activeUsers * (0.5 + rand(weeksAgo * 37 + offset) * 0.3),
            ),
          };
        },
      );
      return { cohortWeekStart: weekStart(weeksAgo), cohortSize, weeks };
    },
  );
  return { dataPoints, ...period(dataPoints, (p) => p.cohortWeekStart) };
}

const SEGMENTS: Record<
  RetentionSegmentBy,
  Array<{ name: string; lift: number; share: number }>
> = {
  onboardingState: [
    { name: "COMPLETED", lift: 0.15, share: 0.4 },
    { name: "SKIPPED", lift: -0.05, share: 0.25 },
    { name: "IN_PROGRESS", lift: 0, share: 0.15 },
    { name: "NOT_STARTED", lift: -0.1, share: 0.12 },
    { name: "NONE", lift: -0.12, share: 0.08 },
  ],
  notifiedFirstWeek: [
    { name: "notified", lift: 0.18, share: 0.45 },
    { name: "not_notified", lift: -0.08, share: 0.55 },
  ],
};

export function mockRetentionSegmentsStats(
  segmentBy: RetentionSegmentBy,
): RetentionSegmentsStatsDTO {
  const totalUsers = Array.from({ length: WEEKS }, (_, i) =>
    mockCohortSize(i + 1),
  ).reduce((s, v) => s + v, 0);
  const maxOffset = WEEKS - 1;

  const dataPoints: RetentionSegmentDataPoint[] = SEGMENTS[segmentBy].map(
    (seg, si) => {
      const userCount = Math.floor(totalUsers * seg.share);
      const weeks = Array.from({ length: maxOffset }, (_, o) => {
        const offset = o + 1;
        // Right-censoring: fewer users are old enough for deeper offsets.
        const eligibleUsers = Math.max(
          1,
          Math.floor(userCount * (1 - offset / WEEKS)),
        );
        const rate = Math.min(
          0.95,
          Math.max(
            0.01,
            baseRate(20, offset) +
              seg.lift +
              (rand(si * 41 + offset) - 0.5) * 0.04,
          ),
        );
        const activeUsers = Math.round(eligibleUsers * rate);
        return {
          weekOffset: offset,
          eligibleUsers,
          activeUsers,
          curatingUsers: Math.round(
            activeUsers * (0.5 + rand(si * 43 + offset) * 0.3),
          ),
        };
      });
      return { segment: seg.name, userCount, weeks };
    },
  );
  dataPoints.sort(
    (a, b) => b.userCount - a.userCount || a.segment.localeCompare(b.segment),
  );

  return {
    segmentBy,
    dataPoints,
    periodStart: weekStart(WEEKS),
    periodEnd: weekStart(1),
  };
}
