// Mock onboarding stats, used until the /api/stats/onboarding/* endpoints ship.
//
// Enabled by setting ONBOARDING_ANALYTICS_MOCK=true. The DAL falls back to
// these when the flag is on, so the tab can be developed and reviewed against
// realistic shapes. Delete this file (and the flag branch in dal.ts) once the
// endpoints are live.

import type {
  OnboardingMinimalProfileDTO,
  OnboardingSummaryStatsDTO,
  OnboardingWeeklyStatsDTO,
} from "../types";

const NAMES = [
  "ada",
  "brook",
  "cyrus",
  "dara",
  "eli",
  "fern",
  "gus",
  "hana",
  "ines",
  "jo",
  "kit",
  "lou",
  "mira",
  "nico",
  "opal",
  "pax",
  "quinn",
  "rune",
  "sana",
  "tao",
  "uma",
  "vero",
  "wren",
  "yuki",
];

function profile(i: number): OnboardingMinimalProfileDTO {
  const name = NAMES[i % NAMES.length];
  const suffix = i >= NAMES.length ? String(Math.floor(i / NAMES.length)) : "";
  return {
    id: `did:plc:mock${i}`,
    name: `${name[0].toUpperCase()}${name.slice(1)}${suffix}`,
    handle: `${name}${suffix}.bsky.social`,
  };
}

/**
 * Deterministic pseudo-random in [0,1) — seeded so the mock is stable across
 * renders (no hydration mismatch, no churn between refreshes).
 */
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Pick `count` distinct users, varied by seed. */
function users(count: number, seed: number): OnboardingMinimalProfileDTO[] {
  return Array.from({ length: count }, (_, i) =>
    profile(Math.floor(rand(seed + i) * 60)),
  ).filter(
    (u, i, arr) => arr.findIndex((other) => other.id === u.id) === i,
  );
}

function weeklyCounts(count: number, seed: number, total: number) {
  return {
    totalUserCount: total,
    weeklyUserCount: count,
    weeklyUsers: users(count, seed),
  };
}

/** Build a value-stat dimension: overall counts plus a per-value breakdown. */
function valueStats<K extends string, V>(
  key: K,
  seed: number,
  total: number,
  entries: Array<[V, number]>,
) {
  // A user can pick several values, so the dimension total is the distinct-user
  // count — below the sum of per-value counts, not equal to it.
  const summed = entries.reduce((s, [, n]) => s + n, 0);
  const distinct = Math.max(...entries.map(([, n]) => n), Math.round(summed * 0.6));
  return {
    ...weeklyCounts(distinct, seed, total),
    stats: entries.map(([value, n], i) => ({
      [key]: value,
      ...weeklyCounts(n, seed + (i + 1) * 17, total * (i + 1)),
    })) as Array<Record<K, V> & ReturnType<typeof weeklyCounts>>,
  };
}

const TOPICS: Array<[string, number]> = [
  ["ai & ml", 9],
  ["design", 7],
  ["climate", 5],
  ["philosophy", 4],
  ["biology", 3],
  ["urbanism", 2],
];

const LINKS_SUGGESTED: Array<[string, number]> = [
  ["https://arxiv.org/abs/2401.00001", 8],
  ["https://www.nature.com/articles/d41586", 6],
  ["https://longnow.org/essays/", 5],
  ["https://distill.pub/2021/gnn-intro/", 3],
];

const LINKS_SELECTED: Array<[string, number]> = [
  ["https://arxiv.org/abs/2401.00001", 6],
  ["https://longnow.org/essays/", 4],
  ["https://distill.pub/2021/gnn-intro/", 2],
];

const ACCOUNTS: Array<[OnboardingMinimalProfileDTO, number]> = [
  [profile(3), 11],
  [profile(7), 8],
  [profile(12), 6],
  [profile(19), 4],
];

const COLLECTIONS: Array<
  [{ id: string; name: string; cardCount: number }, number]
> = [
  [{ id: "col-001", name: "Systems Reading", cardCount: 42 }, 9],
  [{ id: "col-002", name: "Interface Patterns", cardCount: 28 }, 7],
  [{ id: "col-003", name: "Climate Futures", cardCount: 17 }, 4],
];

const FIRST_CARDS: Array<[string, number]> = [
  ["https://en.wikipedia.org/wiki/Stigmergy", 5],
  ["https://www.newyorker.com/magazine/", 4],
  ["https://arxiv.org/abs/2401.00001", 3],
];

export function mockWeeklyStats(endWeek?: string): OnboardingWeeklyStatsDTO {
  const cohortWeekStart = endWeek ?? "2026-08-03";
  // Vary counts by week so navigating back/forward visibly changes the data.
  const seed = Number(cohortWeekStart.replaceAll("-", "")) % 9973;
  const jitter = (base: number) => Math.max(0, base + Math.round(rand(seed + base) * 6) - 3);

  const newUsers = jitter(27);

  return {
    cohortWeekStart,
    totalNewUserCount: 412,
    weeklyNewUsersCount: newUsers,
    onboardingState: {
      stats: [
        { state: "completed", ...weeklyCounts(jitter(12), seed + 1, 240) },
        { state: "in_progress", ...weeklyCounts(jitter(9), seed + 2, 118) },
        { state: "not_started", ...weeklyCounts(jitter(6), seed + 3, 54) },
      ],
    },
    topicsSelected: valueStats("topic", seed + 10, 301, TOPICS),
    linksSuggested: valueStats("link", seed + 20, 288, LINKS_SUGGESTED),
    linksSelected: valueStats("link", seed + 30, 214, LINKS_SELECTED),
    suggestedAccounts: valueStats("user", seed + 40, 262, ACCOUNTS),
    suggestedCollections: valueStats(
      "collection",
      seed + 50,
      193,
      COLLECTIONS,
    ),
    followedAccounts: valueStats("user", seed + 60, 168, ACCOUNTS.slice(0, 3)),
    followedCollections: valueStats(
      "collection",
      seed + 70,
      141,
      COLLECTIONS.slice(0, 2),
    ),
    firstCards: valueStats("link", seed + 80, 223, FIRST_CARDS),
    firstCollections: {
      ...weeklyCounts(jitter(5), seed + 90, 131),
      stats: [
        {
          collection: {
            id: "col-101",
            name: "My First Collection",
            cardCount: 3,
            createdAt: "2026-08-04T10:12:00.000Z",
            author: profile(5),
          },
          creator: profile(5),
        },
        {
          collection: {
            id: "col-102",
            name: "Papers to read",
            cardCount: 6,
            createdAt: "2026-08-05T14:02:00.000Z",
            author: profile(11),
          },
          creator: profile(11),
        },
      ],
    },
    firstConnection: {
      ...weeklyCounts(jitter(3), seed + 100, 92),
      stats: [
        {
          connection: {
            id: "con-201",
            type: "supports",
            note: "similar argument, different field",
            createdAt: "2026-08-06T09:30:00.000Z",
            source: "https://arxiv.org/abs/2401.00001",
            target: "https://distill.pub/2021/gnn-intro/",
          },
          creator: profile(8),
        },
      ],
    },
    pwaClicked: weeklyCounts(jitter(5), seed + 110, 83),
    iosShortcutClicked: weeklyCounts(jitter(2), seed + 120, 41),
    browserExtensionClicked: weeklyCounts(jitter(4), seed + 130, 72),
    mcpClicked: weeklyCounts(jitter(1), seed + 140, 19),
    saveModalGuideCompleted: weeklyCounts(jitter(8), seed + 150, 152),
    connectionCreationModalCompleted: weeklyCounts(jitter(3), seed + 160, 61),
    semblePageNavigationCompleted: weeklyCounts(jitter(7), seed + 170, 114),
    intention: valueStats("intention", seed + 180, 312, [
      ["research", 11],
      ["curate for others", 7],
      ["personal memory", 5],
      ["just exploring", 3],
    ]),
    referralSource: valueStats("referralSource", seed + 190, 295, [
      ["twitter / x", 10],
      ["a friend", 8],
      ["bluesky", 5],
      ["search", 2],
    ]),
  };
}

export function mockSummaryStats(): OnboardingSummaryStatsDTO {
  const t = (n: number) => ({ totalUserCount: n });
  const sv = <K extends string, V>(key: K, entries: Array<[V, number]>) => ({
    // Distinct users, so below the sum of per-value counts (users pick several).
    totalUserCount: Math.round(entries.reduce((s, [, n]) => s + n, 0) * 0.6),
    stats: entries.map(([value, n]) => ({
      [key]: value,
      totalUserCount: n,
    })) as Array<Record<K, V> & { totalUserCount: number }>,
  });

  return {
    totalNewUserCount: 412,
    onboardingState: {
      stats: [
        { state: "completed", ...t(240) },
        { state: "in_progress", ...t(118) },
        { state: "not_started", ...t(54) },
      ],
    },
    topicsSelected: sv("topic", [
      ["ai & ml", 142],
      ["design", 118],
      ["climate", 87],
      ["philosophy", 64],
      ["biology", 41],
      ["urbanism", 29],
    ]),
    linksSuggested: sv("link", LINKS_SUGGESTED.map(([l, n]) => [l, n * 31])),
    linksSelected: sv("link", LINKS_SELECTED.map(([l, n]) => [l, n * 27])),
    suggestedAccounts: sv("user", ACCOUNTS.map(([u, n]) => [u, n * 23])),
    suggestedCollections: sv(
      "collection",
      COLLECTIONS.map(([c, n]) => [c, n * 19]),
    ),
    followedAccounts: sv(
      "user",
      ACCOUNTS.slice(0, 3).map(([u, n]) => [u, n * 14]),
    ),
    followedCollections: sv(
      "collection",
      COLLECTIONS.slice(0, 2).map(([c, n]) => [c, n * 12]),
    ),
    firstCards: sv("link", FIRST_CARDS.map(([l, n]) => [l, n * 21])),
    firstCollections: t(131),
    firstConnection: t(92),
    pwaClicked: t(83),
    iosShortcutClicked: t(41),
    browserExtensionClicked: t(72),
    mcpClicked: t(19),
    saveModalGuideCompleted: t(152),
    connectionCreationModalCompleted: t(61),
    semblePageNavigationCompleted: t(114),
    intention: sv("intention", [
      ["research", 138],
      ["curate for others", 92],
      ["personal memory", 61],
      ["just exploring", 34],
    ]),
    referralSource: sv("referralSource", [
      ["twitter / x", 121],
      ["a friend", 96],
      ["bluesky", 58],
      ["search", 27],
    ]),
  };
}
