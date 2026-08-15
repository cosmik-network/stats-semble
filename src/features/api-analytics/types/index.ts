// API usage analytics DTOs — mirror GET /api/stats/api-usage.

export interface ApiUsageSource {
  source: string; // client's X-Semble-Client header or inferred ('api', 'extension')
  users: number; // distinct users
  calls: number; // total requests
}

export interface ApiUsageDataPoint {
  weekStart: string; // ISO date of the week's Monday
  sources: ApiUsageSource[]; // sorted by calls desc (ties: source asc)
}

export interface ApiUsageEndpoint {
  method: string;
  endpoint: string; // route pattern, e.g. /xrpc/cards/:id
  calls: number;
  users: number;
}

export interface ApiUsageTotal extends ApiUsageSource {
  topEndpoints: ApiUsageEndpoint[]; // top 10 by calls desc
}

export interface ApiUsageStatsDTO {
  dataPoints: ApiUsageDataPoint[]; // chronological, oldest -> newest, gap-filled
  totals: ApiUsageTotal[]; // whole-period, sorted by calls desc
  periodStart: string;
  periodEnd: string;
}
