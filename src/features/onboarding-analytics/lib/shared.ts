// Shared field definitions + week helpers for onboarding analytics.
//
// The weekly and summary endpoints expose the same set of dimensions, so both
// views are driven off one ordered list of field definitions. Each field is
// read out of its DTO by an accessor rather than a shared key, because the
// dimensions sit at different depths (top-level, milestone, value-stat).

import type {
  OnboardingSummaryStatsDTO,
  OnboardingWeeklyStatsDTO,
  OnboardingMinimalProfileDTO,
  OnboardingCollectionDTO,
  OnboardingConnectionDTO,
} from "../types";

export interface FieldGroup {
  title: string;
  fields: FieldDef[];
}

export interface FieldDef {
  key: string;
  label: string;
  weekly: (d: OnboardingWeeklyStatsDTO) => WeeklyField;
  summary: (d: OnboardingSummaryStatsDTO) => SummaryField;
}

/** A single row's weekly data: a count plus the users behind it. */
export interface WeeklyField {
  count: number;
  users: OnboardingMinimalProfileDTO[];
  /** Per-value breakdown (topics, links, accounts…), when the dimension has one. */
  breakdown?: BreakdownEntry[];
}

/**
 * A single row's all-time data: a total plus, where the dimension has one, its
 * ranked per-value list. The summary endpoint returns no user lists, so values
 * carry counts only.
 */
export interface SummaryField {
  count: number;
  values?: SummaryValue[];
}

export interface SummaryValue {
  label: string;
  count: number;
}

export interface BreakdownEntry {
  label: string;
  count: number;
  users: OnboardingMinimalProfileDTO[];
}

// --- value formatters for the per-value breakdowns -------------------------

function profileLabel(p: OnboardingMinimalProfileDTO): string {
  return p.handle ? `@${p.handle}` : p.name || p.id;
}

function collectionLabel(c: OnboardingCollectionDTO): string {
  return c.name ?? c.id;
}

function connectionLabel(c: OnboardingConnectionDTO): string {
  const type = c.type ? `${c.type}: ` : "";
  return `${type}${c.source ?? c.id}${c.target ? ` → ${c.target}` : ""}`;
}

// --- field definition helpers ---------------------------------------------

type WeeklyCountsLike = {
  weeklyUserCount: number;
  weeklyUsers: OnboardingMinimalProfileDTO[];
};

type SummaryCountsLike = {
  totalUserCount: number;
};

/** A dimension with no per-value breakdown (milestones, plain counts). */
function plain(
  key: string,
  label: string,
  weekly: (d: OnboardingWeeklyStatsDTO) => WeeklyCountsLike,
  summary: (d: OnboardingSummaryStatsDTO) => number,
): FieldDef {
  return {
    key,
    label,
    weekly: (d) => {
      const c = weekly(d);
      return { count: c.weeklyUserCount, users: c.weeklyUsers };
    },
    summary: (d) => ({ count: summary(d) }),
  };
}

/**
 * A dimension whose `stats` carry a per-value breakdown. `valueKey` names the
 * property holding the value (e.g. "topic", "link", "user"), which differs per
 * dimension — inferring it keeps `toLabel` checked against the real value type
 * instead of falling back to a cast.
 */
function withBreakdown<K extends string, V>(
  key: string,
  label: string,
  weekly: (
    d: OnboardingWeeklyStatsDTO,
  ) => WeeklyCountsLike & {
    stats: Array<Record<K, V> & WeeklyCountsLike>;
  },
  valueKey: K,
  toLabel: (value: V) => string,
  summary: (
    d: OnboardingSummaryStatsDTO,
  ) => SummaryCountsLike & {
    stats: Array<Record<K, V> & SummaryCountsLike>;
  },
): FieldDef {
  return {
    key,
    label,
    weekly: (d) => {
      const c = weekly(d);
      return {
        count: c.weeklyUserCount,
        users: c.weeklyUsers,
        breakdown: c.stats
          .map((s) => ({
            label: toLabel(s[valueKey]),
            count: s.weeklyUserCount,
            users: s.weeklyUsers,
          }))
          .sort((a, b) => b.count - a.count),
      };
    },
    summary: (d) => {
      const c = summary(d);
      return {
        count: c.totalUserCount,
        values: c.stats
          .map((s) => ({
            label: toLabel(s[valueKey]),
            count: s.totalUserCount,
          }))
          .sort((a, b) => b.count - a.count),
      };
    },
  };
}

const identity = (v: string): string => v;

// --- the field catalogue ---------------------------------------------------

export const FIELD_GROUPS: FieldGroup[] = [
  {
    title: "intent",
    fields: [
      withBreakdown(
        "intention",
        "intention",
        (d) => d.intention,
        "intention",
        identity,
        (d) => d.intention,
      ),
      withBreakdown(
        "referralSource",
        "referral source",
        (d) => d.referralSource,
        "referralSource",
        identity,
        (d) => d.referralSource,
      ),
      withBreakdown(
        "topicsSelected",
        "topics selected",
        (d) => d.topicsSelected,
        "topic",
        identity,
        (d) => d.topicsSelected,
      ),
    ],
  },
  {
    title: "discovery",
    fields: [
      withBreakdown(
        "linksSuggested",
        "links suggested",
        (d) => d.linksSuggested,
        "link",
        identity,
        (d) => d.linksSuggested,
      ),
      withBreakdown(
        "linksSelected",
        "links selected",
        (d) => d.linksSelected,
        "link",
        identity,
        (d) => d.linksSelected,
      ),
      withBreakdown(
        "suggestedAccounts",
        "accounts suggested",
        (d) => d.suggestedAccounts,
        "user",
        profileLabel,
        (d) => d.suggestedAccounts,
      ),
      withBreakdown(
        "followedAccounts",
        "accounts followed",
        (d) => d.followedAccounts,
        "user",
        profileLabel,
        (d) => d.followedAccounts,
      ),
      withBreakdown(
        "suggestedCollections",
        "collections suggested",
        (d) => d.suggestedCollections,
        "collection",
        collectionLabel,
        (d) => d.suggestedCollections,
      ),
      withBreakdown(
        "followedCollections",
        "collections followed",
        (d) => d.followedCollections,
        "collection",
        collectionLabel,
        (d) => d.followedCollections,
      ),
    ],
  },
  {
    title: "first actions",
    fields: [
      withBreakdown(
        "firstCards",
        "first card",
        (d) => d.firstCards,
        "link",
        identity,
        (d) => d.firstCards,
      ),
      {
        key: "firstCollections",
        label: "first collection",
        weekly: (d) => ({
          count: d.firstCollections.weeklyUserCount,
          users: d.firstCollections.weeklyUsers,
          // firstCollections stats are per-item (not per-user), so each entry
          // is one collection with its creator as the sole "user".
          breakdown: d.firstCollections.stats.map((s) => ({
            label: collectionLabel(s.collection),
            count: 1,
            users: s.creator ? [s.creator] : [],
          })),
        }),
        summary: (d) => ({ count: d.firstCollections.totalUserCount }),
      },
      {
        key: "firstConnection",
        label: "first connection",
        weekly: (d) => ({
          count: d.firstConnection.weeklyUserCount,
          users: d.firstConnection.weeklyUsers,
          breakdown: d.firstConnection.stats.map((s) => ({
            label: connectionLabel(s.connection),
            count: 1,
            users: s.creator ? [s.creator] : [],
          })),
        }),
        summary: (d) => ({ count: d.firstConnection.totalUserCount }),
      },
    ],
  },
  {
    title: "milestones",
    fields: [
      plain(
        "pwaClicked",
        "pwa clicked",
        (d) => d.pwaClicked,
        (d) => d.pwaClicked.totalUserCount,
      ),
      plain(
        "iosShortcutClicked",
        "ios shortcut clicked",
        (d) => d.iosShortcutClicked,
        (d) => d.iosShortcutClicked.totalUserCount,
      ),
      plain(
        "browserExtensionClicked",
        "browser extension clicked",
        (d) => d.browserExtensionClicked,
        (d) => d.browserExtensionClicked.totalUserCount,
      ),
      plain(
        "mcpClicked",
        "mcp clicked",
        (d) => d.mcpClicked,
        (d) => d.mcpClicked.totalUserCount,
      ),
      plain(
        "saveModalGuideCompleted",
        "save modal guide completed",
        (d) => d.saveModalGuideCompleted,
        (d) => d.saveModalGuideCompleted.totalUserCount,
      ),
      plain(
        "connectionCreationModalCompleted",
        "connection modal completed",
        (d) => d.connectionCreationModalCompleted,
        (d) => d.connectionCreationModalCompleted.totalUserCount,
      ),
      plain(
        "semblePageNavigationCompleted",
        "semble page nav completed",
        (d) => d.semblePageNavigationCompleted,
        (d) => d.semblePageNavigationCompleted.totalUserCount,
      ),
    ],
  },
];

// --- funnel ----------------------------------------------------------------

/**
 * A quick "how far did people get" read on the weekly cohort. Steps are counted
 * INDEPENDENTLY against the signup cohort (as the product funnel's rungs are) —
 * they are not nested, so a later step can exceed an earlier one. Rendered in
 * onboarding-order rather than by size.
 */
export interface FunnelStep {
  key: string;
  label: string;
  color: string;
  value: (d: OnboardingWeeklyStatsDTO) => number;
}

// Reuses the product analytics funnel palette so both tabs read alike.
const FUNNEL_COLORS = [
  "#5b8def",
  "#7b84ef",
  "#a07bf0",
  "#c471d8",
  "#e06bab",
  "#f0865b",
  "#f0b65b",
  "#3ec97a",
] as const;

export const FUNNEL_STEPS: FunnelStep[] = [
  {
    key: "newUsers",
    label: "new users",
    color: FUNNEL_COLORS[0],
    value: (d) => d.weeklyNewUsersCount,
  },
  {
    key: "topicsSelected",
    label: "topics selected",
    color: FUNNEL_COLORS[1],
    value: (d) => d.topicsSelected.weeklyUserCount,
  },
  {
    key: "linksSelected",
    label: "links selected",
    color: FUNNEL_COLORS[2],
    value: (d) => d.linksSelected.weeklyUserCount,
  },
  {
    key: "followedAccounts",
    label: "followed accounts",
    color: FUNNEL_COLORS[3],
    value: (d) => d.followedAccounts.weeklyUserCount,
  },
  {
    key: "followedCollections",
    label: "followed collections",
    color: FUNNEL_COLORS[4],
    value: (d) => d.followedCollections.weeklyUserCount,
  },
  {
    key: "firstCards",
    label: "first card",
    color: FUNNEL_COLORS[5],
    value: (d) => d.firstCards.weeklyUserCount,
  },
  {
    key: "firstCollections",
    label: "first collection",
    color: FUNNEL_COLORS[6],
    value: (d) => d.firstCollections.weeklyUserCount,
  },
  {
    key: "firstConnection",
    label: "first connection",
    color: FUNNEL_COLORS[7],
    value: (d) => d.firstConnection.weeklyUserCount,
  },
];

// --- week helpers ----------------------------------------------------------

/** Monday (UTC) of the current, still-incomplete week as an ISO date string. */
export function currentWeekStart(now: Date = new Date()): string {
  const d = new Date(now);
  // getUTCDay: Sun=0 … Sat=6; shift back to the most recent Monday.
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d.toISOString().slice(0, 10);
}

/** Shift an ISO week-start by N weeks (UTC) and return an ISO date string. */
export function shiftWeek(iso: string, deltaWeeks: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + deltaWeeks * 7);
  return d.toISOString().slice(0, 10);
}
