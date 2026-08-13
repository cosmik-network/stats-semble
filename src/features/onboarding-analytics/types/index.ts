// Onboarding analytics DTOs — mirror the server-side onboarding stats endpoints
// (GET /api/stats/onboarding/weekly and /summary).

export interface OnboardingMinimalProfileDTO {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

/** Only `id` is guaranteed — the rest is absent when the stored UUID didn't resolve. */
export interface OnboardingCollectionDTO {
  id: string;
  name?: string;
  description?: string;
  cardCount?: number;
  createdAt?: string;
  author?: OnboardingMinimalProfileDTO;
}

/** Only `id` is guaranteed — the rest is absent when the stored UUID didn't resolve. */
export interface OnboardingConnectionDTO {
  id: string;
  type?: string;
  note?: string;
  createdAt?: string;
  source?: string; // URL or card id string
  target?: string;
}

export interface OnboardingWeeklyCounts {
  totalUserCount: number;
  weeklyUserCount: number;
  weeklyUsers: OnboardingMinimalProfileDTO[];
}

export interface OnboardingSummaryCounts {
  totalUserCount: number;
}

type WeeklyValueStats<K extends string, V> = OnboardingWeeklyCounts & {
  stats: Array<{ [key in K]: V } & OnboardingWeeklyCounts>;
};

type SummaryValueStats<K extends string, V> = OnboardingSummaryCounts & {
  stats: Array<{ [key in K]: V } & OnboardingSummaryCounts>;
};

export interface OnboardingWeeklyStatsDTO {
  cohortWeekStart: string;
  totalNewUserCount: number;
  weeklyNewUsersCount: number;
  onboardingState: {
    stats: Array<{ state: string } & OnboardingWeeklyCounts>;
  };
  topicsSelected: WeeklyValueStats<"topic", string>;
  linksSuggested: WeeklyValueStats<"link", string>;
  linksSelected: WeeklyValueStats<"link", string>;
  suggestedAccounts: WeeklyValueStats<"user", OnboardingMinimalProfileDTO>;
  suggestedCollections: WeeklyValueStats<"collection", OnboardingCollectionDTO>;
  followedAccounts: WeeklyValueStats<"user", OnboardingMinimalProfileDTO>;
  followedCollections: WeeklyValueStats<"collection", OnboardingCollectionDTO>;
  firstCards: WeeklyValueStats<"link", string>;
  firstCollections: OnboardingWeeklyCounts & {
    stats: Array<{
      collection: OnboardingCollectionDTO;
      creator?: OnboardingMinimalProfileDTO;
    }>;
  };
  firstConnection: OnboardingWeeklyCounts & {
    stats: Array<{
      connection: OnboardingConnectionDTO;
      creator?: OnboardingMinimalProfileDTO;
    }>;
  };
  pwaClicked: OnboardingWeeklyCounts;
  iosShortcutClicked: OnboardingWeeklyCounts;
  browserExtensionClicked: OnboardingWeeklyCounts;
  mcpClicked: OnboardingWeeklyCounts;
  saveModalGuideCompleted: OnboardingWeeklyCounts;
  connectionCreationModalCompleted: OnboardingWeeklyCounts;
  semblePageNavigationCompleted: OnboardingWeeklyCounts;
  intention: WeeklyValueStats<"intention", string>;
  referralSource: WeeklyValueStats<"referralSource", string>;
}

export interface OnboardingSummaryStatsDTO {
  totalNewUserCount: number;
  onboardingState: {
    stats: Array<{ state: string } & OnboardingSummaryCounts>;
  };
  topicsSelected: SummaryValueStats<"topic", string>;
  linksSuggested: SummaryValueStats<"link", string>;
  linksSelected: SummaryValueStats<"link", string>;
  suggestedAccounts: SummaryValueStats<"user", OnboardingMinimalProfileDTO>;
  suggestedCollections: SummaryValueStats<
    "collection",
    OnboardingCollectionDTO
  >;
  followedAccounts: SummaryValueStats<"user", OnboardingMinimalProfileDTO>;
  followedCollections: SummaryValueStats<"collection", OnboardingCollectionDTO>;
  firstCards: SummaryValueStats<"link", string>;
  firstCollections: OnboardingSummaryCounts;
  firstConnection: OnboardingSummaryCounts;
  pwaClicked: OnboardingSummaryCounts;
  iosShortcutClicked: OnboardingSummaryCounts;
  browserExtensionClicked: OnboardingSummaryCounts;
  mcpClicked: OnboardingSummaryCounts;
  saveModalGuideCompleted: OnboardingSummaryCounts;
  connectionCreationModalCompleted: OnboardingSummaryCounts;
  semblePageNavigationCompleted: OnboardingSummaryCounts;
  intention: SummaryValueStats<"intention", string>;
  referralSource: SummaryValueStats<"referralSource", string>;
}
