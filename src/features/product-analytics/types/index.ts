// Product analytics DTOs — mirror the server-side read-only dashboard queries.

export interface WacDataPoint {
  weekStart: string; // ISO date of the week's Monday
  collectionOrConnection: number; // distinct users who added a card to a collection OR created a connection
  collectionAdd: number; // distinct users who added a card to any collection
  connection: number; // distinct users who created a connection
  othersCollectionAdd: number; // distinct users who added a card to SOMEONE ELSE'S collection
}

export interface WacStatsDTO {
  dataPoints: WacDataPoint[]; // chronological, oldest -> newest, gap-filled
  periodStart: string; // ISO week-start of the first data point
  periodEnd: string; // ISO week-start of the last data point
}

export interface ActivationFunnelDataPoint {
  cohortWeekStart: string; // ISO date of the signup week's Monday
  signups: number; // rung 0: users who signed up that week
  savedUrlCard7d: number; // rung 1: saved a URL card within 7d of signup
  curated14d: number; // rung 2: added to a collection OR connected within 14d
  notified30d: number; // rung 3: received a notification within 30d
}

export interface ActivationFunnelStatsDTO {
  dataPoints: ActivationFunnelDataPoint[]; // chronological, oldest -> newest, gap-filled
  periodStart: string; // ISO cohort-week-start of the first data point
  periodEnd: string; // ISO cohort-week-start of the last data point
}
