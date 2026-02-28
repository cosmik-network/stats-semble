/**
 * UFOs API client for fetching Semble records
 */

import {
  CardRecord,
  CollectionRecord,
} from "@cosmik.network/semble-pds-client";
import type {
  UFOsRecord,
  StatsResponse,
  TimeseriesResponse,
} from "../types/index";

const UFOS_API_BASE = "https://ufos-api.microcosm.blue";

export class UFOsClient {
  private baseUrl: string;

  constructor(baseUrl: string = UFOS_API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch records for a specific collection (lexicon)
   * @param collection - The lexicon namespace (e.g., "network.cosmik.card")
   * @param limit - Maximum number of records to fetch (optional)
   */
  async fetchRecords<T = CardRecord | CollectionRecord>(
    collection: string,
    limit?: number,
  ): Promise<UFOsRecord<T>[]> {
    const params = new URLSearchParams({ collection });
    if (limit) {
      params.append("limit", limit.toString());
    }

    const url = `${this.baseUrl}/records?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data as UFOsRecord<T>[];
    } catch (error) {
      console.error(`Error fetching records from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Fetch all card records
   */
  async fetchCards(limit?: number): Promise<UFOsRecord<CardRecord>[]> {
    return this.fetchRecords<CardRecord>("network.cosmik.card", limit);
  }

  /**
   * Fetch all collection records
   */
  async fetchCollections(
    limit?: number,
  ): Promise<UFOsRecord<CollectionRecord>[]> {
    return this.fetchRecords<CollectionRecord>(
      "network.cosmik.collection",
      limit,
    );
  }

  /**
   * Fetch aggregate statistics for one or more collections
   * @param collections - Array of collection NSIDs (e.g., ["network.cosmik.card"])
   * @param since - Start date for statistics (ISO 8601 format, defaults to beginning of time)
   * @param until - End date for statistics (ISO 8601 format, defaults to now)
   */
  async fetchCollectionStats(
    collections: string[],
    since?: string,
    until?: string,
  ): Promise<StatsResponse> {
    const params = new URLSearchParams();

    collections.forEach((collection) => {
      params.append("collection", collection);
    });

    if (since) {
      params.append("since", since);
    }

    if (until) {
      params.append("until", until);
    }

    const url = `${this.baseUrl}/collections/stats?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data as StatsResponse;
    } catch (error) {
      console.error(`Error fetching stats from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Fetch timeseries data for a collection
   * @param collection - Collection NSID (e.g., "network.cosmik.card")
   * @param since - Start date for timeseries (ISO 8601 format, defaults to 1 week ago)
   * @param until - End date for timeseries (ISO 8601 format, defaults to now)
   * @param step - Time step in seconds (minimum 3600, defaults to 86400 for daily)
   */
  async fetchTimeseries(
    collection: string,
    since?: string,
    until?: string,
    step?: number,
  ): Promise<TimeseriesResponse> {
    const params = new URLSearchParams({ collection });

    if (since) {
      params.append("since", since);
    }

    if (until) {
      params.append("until", until);
    }

    if (step) {
      params.append("step", step.toString());
    }

    const url = `${this.baseUrl}/timeseries?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data as TimeseriesResponse;
    } catch (error) {
      console.error(`Error fetching timeseries from ${url}:`, error);
      throw error;
    }
  }
}
