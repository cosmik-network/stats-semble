/**
 * Analytics functions for Semble app activity
 */

import { UFOsClient } from "./api";
import type { AnalyticsResult, DailyMetrics } from "../types/index.ts";

export class SembleAnalytics {
  private client: UFOsClient;

  constructor(client?: UFOsClient) {
    this.client = client || new UFOsClient();
  }

  /**
   * Get comprehensive analytics for Semble app activity
   * @param since - Start date for analytics (ISO 8601 format, defaults to all time)
   * @param until - End date for analytics (ISO 8601 format, defaults to now)
   * @returns Analytics result with user count and record breakdown
   */
  async getAnalytics(
    since: string = "2025-07-01T00:00:00Z",
    until?: string,
  ): Promise<AnalyticsResult> {
    const stats = await this.client.fetchCollectionStats(
      ["network.cosmik.card", "network.cosmik.collection"],
      since,
      until,
    );

    const cardStats = stats["network.cosmik.card"];
    const collectionStats = stats["network.cosmik.collection"];

    // Use the maximum dids_estimate across both types
    // Note: This is an estimate - the same user may have created both cards and collections
    const uniqueUsersEstimate = Math.max(
      cardStats?.dids_estimate || 0,
      collectionStats?.dids_estimate || 0,
    );

    return {
      uniqueUsersEstimate,
      totalRecordsCreated:
        (cardStats?.creates || 0) + (collectionStats?.creates || 0),
      totalRecordsActive:
        (cardStats?.creates || 0) -
        (cardStats?.deletes || 0) +
        (collectionStats?.creates || 0) -
        (collectionStats?.deletes || 0),
      recordsByType: {
        cards: {
          created: cardStats?.creates || 0,
          updated: cardStats?.updates || 0,
          deleted: cardStats?.deletes || 0,
          active: (cardStats?.creates || 0) - (cardStats?.deletes || 0),
        },
        collections: {
          created: collectionStats?.creates || 0,
          updated: collectionStats?.updates || 0,
          deleted: collectionStats?.deletes || 0,
          active:
            (collectionStats?.creates || 0) - (collectionStats?.deletes || 0),
        },
      },
    };
  }

  /**
   * Get the estimated count of unique users who have created at least one record
   * Note: This is an estimate based on the UFOs API statistics
   */
  async getUniqueUserCountEstimate(
    since?: string,
    until?: string,
  ): Promise<number> {
    const analytics = await this.getAnalytics(since, until);
    return analytics.uniqueUsersEstimate;
  }

  /**
   * Get the total number of records broken down by type
   */
  async getRecordsByType(
    since?: string,
    until?: string,
  ): Promise<{
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
  }> {
    const analytics = await this.getAnalytics(since, until);
    return analytics.recordsByType;
  }

  /**
   * Get Daily Active Users (DAU) for a time period
   * Returns daily metrics including user count and activity
   * @param since - Start date (ISO 8601, defaults to last 7 days)
   * @param until - End date (ISO 8601, defaults to now)
   */
  async getDailyActiveUsers(
    since?: string,
    until?: string,
  ): Promise<DailyMetrics[]> {
    // Fetch timeseries for both cards and collections
    const [cardTimeseries, collectionTimeseries] = await Promise.all([
      this.client.fetchTimeseries("network.cosmik.card", since, until),
      this.client.fetchTimeseries("network.cosmik.collection", since, until),
    ]);

    const cardData = cardTimeseries.series["network.cosmik.card"] || [];
    const collectionData =
      collectionTimeseries.series["network.cosmik.collection"] || [];

    // Combine data by date
    return cardTimeseries.range.map((date, index) => {
      const card = cardData[index] || {
        creates: 0,
        updates: 0,
        deletes: 0,
        dids_estimate: 0,
      };
      const collection = collectionData[index] || {
        creates: 0,
        updates: 0,
        deletes: 0,
        dids_estimate: 0,
      };

      return {
        date,
        activeUsers: Math.max(card.dids_estimate, collection.dids_estimate),
        cards: {
          created: card.creates,
          updated: card.updates,
          deleted: card.deletes,
        },
        collections: {
          created: collection.creates,
          updated: collection.updates,
          deleted: collection.deletes,
        },
      };
    });
  }

  /**
   * Get Weekly Active Users (WAU) for the last 7 days
   * @param referenceDate - Reference date (defaults to now)
   */
  async getWeeklyActiveUsers(referenceDate?: Date): Promise<number> {
    const now = referenceDate || new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const since = sevenDaysAgo.toISOString();
    const until = now.toISOString();

    const stats = await this.client.fetchCollectionStats(
      ["network.cosmik.card", "network.cosmik.collection"],
      since,
      until,
    );

    const cardStats = stats["network.cosmik.card"];
    const collectionStats = stats["network.cosmik.collection"];

    // Return the maximum estimate (users may have created both types)
    return Math.max(
      cardStats?.dids_estimate || 0,
      collectionStats?.dids_estimate || 0,
    );
  }

  /**
   * Get Monthly Active Users (MAU) for the last 30 days
   * @param referenceDate - Reference date (defaults to now)
   */
  async getMonthlyActiveUsers(referenceDate?: Date): Promise<number> {
    const now = referenceDate || new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const since = thirtyDaysAgo.toISOString();
    const until = now.toISOString();

    const stats = await this.client.fetchCollectionStats(
      ["network.cosmik.card", "network.cosmik.collection"],
      since,
      until,
    );

    const cardStats = stats["network.cosmik.card"];
    const collectionStats = stats["network.cosmik.collection"];

    // Return the maximum estimate (users may have created both types)
    return Math.max(
      cardStats?.dids_estimate || 0,
      collectionStats?.dids_estimate || 0,
    );
  }

  /**
   * Get current DAU (Daily Active Users for today)
   */
  async getCurrentDAU(): Promise<number> {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const stats = await this.client.fetchCollectionStats(
      ["network.cosmik.card", "network.cosmik.collection"],
      startOfToday.toISOString(),
    );

    const cardStats = stats["network.cosmik.card"];
    const collectionStats = stats["network.cosmik.collection"];

    return Math.max(
      cardStats?.dids_estimate || 0,
      collectionStats?.dids_estimate || 0,
    );
  }
}
