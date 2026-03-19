import {
  CardRecord,
  CollectionRecord,
} from "@cosmik.network/semble-pds-client";

export interface UFOsRecord<T = CardRecord | CollectionRecord> {
  did: string;
  collection: string;
  rkey: string;
  record: T;
  time_us: number;
}

export interface CollectionStats {
  creates: number;
  updates: number;
  deletes: number;
  dids_estimate: number;
}

export interface StatsResponse {
  [collection: string]: CollectionStats;
}

export interface TimeseriesDataPoint {
  creates: number;
  updates: number;
  deletes: number;
  dids_estimate: number;
}

export interface TimeseriesResponse {
  range: string[]; // Array of ISO 8601 date strings
  series: {
    [collection: string]: TimeseriesDataPoint[];
  };
}

export interface DailyMetrics {
  date: string;
  activeUsers: number;
  cards: {
    created: number;
    updated: number;
    deleted: number;
  };
  collections: {
    created: number;
    updated: number;
    deleted: number;
  };
  follows: {
    created: number;
    updated: number;
    deleted: number;
  };
}

export interface AnalyticsResult {
  uniqueUsersEstimate: number;
  totalRecordsCreated: number;
  totalRecordsActive: number; // creates - deletes
  recordsByType: {
    cards: {
      created: number;
      updated: number;
      deleted: number;
      active: number;
    };
    collections: {
      created: number;
      updated: number;
      deleted: number;
      active: number;
    };
    follows: {
      created: number;
      updated: number;
      deleted: number;
      active: number;
    };
  };
}
