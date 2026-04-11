export interface GrowthDataPoint {
  date: string;
  totalUsers: number;
  newUsers: number;
}

export interface GrowthStats {
  dataPoints: GrowthDataPoint[];
  currentTotal: number;
  periodStart: string;
  periodEnd: string;
}

export interface EngagementDataPoint {
  date: string;
  activeUsers: number;
  newlyActivatedUsers: number;
  cumulativeActiveUsers: number;
}

export interface EngagementStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersWithCards: number;
  usersWithCollections: number;
  usersWithConnections: number;
  usersWithFollows: number;
  usersWithContributions: number;
  activationRate: number;
  avgActionsPerActiveUser: number;
  dataPoints?: EngagementDataPoint[];
}

export interface ActivityDataPoint {
  date: string;
  cardsCreated: number;
  collectionsCreated: number;
  connectionsCreated: number;
  followsCreated: number;
  totalActions: number;
}

export interface ActivityTotals {
  cardsCreated: number;
  collectionsCreated: number;
  connectionsCreated: number;
  followsCreated: number;
  totalActions: number;
}

export interface ActivityStats {
  dataPoints: ActivityDataPoint[];
  totals: ActivityTotals;
  periodStart: string;
  periodEnd: string;
}

export interface BreakdownDataPoint {
  date: string;
  urlCards: {
    total: number;
    byType: Record<string, number>;
  };
  collections: {
    total: number;
    byAccessType: Record<string, number>;
  };
  connections: {
    total: number;
    byType: Record<string, number>;
  };
}

export interface BreakdownCurrentTotals {
  urlCards: {
    total: number;
    byType: Record<string, number>;
  };
  collections: {
    total: number;
    byAccessType: Record<string, number>;
  };
  connections: {
    total: number;
    byType: Record<string, number>;
  };
}

export interface BreakdownStats {
  dataPoints: BreakdownDataPoint[];
  currentTotals: BreakdownCurrentTotals;
  periodStart: string;
  periodEnd: string;
}

export type StatType = "growth" | "engagement" | "activity" | "breakdown";
export type IntervalType = "day" | "week" | "month";
