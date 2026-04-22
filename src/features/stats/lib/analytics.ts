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
      [
        "network.cosmik.card",
        "network.cosmik.collection",
        "network.cosmik.follow",
        "network.cosmik.connection",
        "network.cosmik.collectionLink",
      ],
      since,
      until,
    );

    const cardStats = stats["network.cosmik.card"];
    const collectionStats = stats["network.cosmik.collection"];
    const followStats = stats["network.cosmik.follow"];
    const connectionStats = stats["network.cosmik.connection"];
    const collectionLinkStats = stats["network.cosmik.collectionLink"];

    // Use the maximum dids_estimate across all types
    // Note: This is an estimate - the same user may have created cards, collections, and follows
    const uniqueUsersEstimate = Math.max(
      cardStats?.dids_estimate || 0,
      collectionStats?.dids_estimate || 0,
      followStats?.dids_estimate || 0,
      connectionStats?.dids_estimate || 0,
      collectionLinkStats?.dids_estimate || 0,
    );

    return {
      uniqueUsersEstimate,
      totalRecordsCreated:
        (cardStats?.creates || 0) +
        (collectionStats?.creates || 0) +
        (followStats?.creates || 0) +
        (connectionStats?.creates || 0) +
        (collectionLinkStats?.creates || 0),
      totalRecordsActive:
        (cardStats?.creates || 0) -
        (cardStats?.deletes || 0) +
        (collectionStats?.creates || 0) -
        (collectionStats?.deletes || 0) +
        (followStats?.creates || 0) -
        (followStats?.deletes || 0) +
        (connectionStats?.creates || 0) -
        (connectionStats?.deletes || 0) +
        (collectionLinkStats?.creates || 0) -
        (collectionLinkStats?.deletes || 0),
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
        follows: {
          created: followStats?.creates || 0,
          updated: followStats?.updates || 0,
          deleted: followStats?.deletes || 0,
          active: (followStats?.creates || 0) - (followStats?.deletes || 0),
        },
        connections: {
          created: connectionStats?.creates || 0,
          updated: connectionStats?.updates || 0,
          deleted: connectionStats?.deletes || 0,
          active:
            (connectionStats?.creates || 0) - (connectionStats?.deletes || 0),
        },
        collectionLinks: {
          created: collectionLinkStats?.creates || 0,
          updated: collectionLinkStats?.updates || 0,
          deleted: collectionLinkStats?.deletes || 0,
          active:
            (collectionLinkStats?.creates || 0) -
            (collectionLinkStats?.deletes || 0),
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
    follows: {
      created: number;
      updated: number;
      deleted: number;
      active: number;
    };
    connections: {
      created: number;
      updated: number;
      deleted: number;
      active: number;
    };
    collectionLinks: {
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
    // Fetch timeseries for cards, collections, follows, connections, and collectionLinks
    const [
      cardTimeseries,
      collectionTimeseries,
      followTimeseries,
      connectionTimeseries,
      collectionLinkTimeseries,
    ] = await Promise.all([
      this.client.fetchTimeseries("network.cosmik.card", since, until),
      this.client.fetchTimeseries("network.cosmik.collection", since, until),
      this.client.fetchTimeseries("network.cosmik.follow", since, until),
      this.client.fetchTimeseries("network.cosmik.connection", since, until),
      this.client.fetchTimeseries(
        "network.cosmik.collectionLink",
        since,
        until,
      ),
    ]);

    const cardData = cardTimeseries.series["network.cosmik.card"] || [];
    const collectionData =
      collectionTimeseries.series["network.cosmik.collection"] || [];
    const followData = followTimeseries.series["network.cosmik.follow"] || [];
    const connectionData =
      connectionTimeseries.series["network.cosmik.connection"] || [];
    const collectionLinkData =
      collectionLinkTimeseries.series["network.cosmik.collectionLink"] || [];

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
      const follow = followData[index] || {
        creates: 0,
        updates: 0,
        deletes: 0,
        dids_estimate: 0,
      };
      const connection = connectionData[index] || {
        creates: 0,
        updates: 0,
        deletes: 0,
        dids_estimate: 0,
      };
      const collectionLink = collectionLinkData[index] || {
        creates: 0,
        updates: 0,
        deletes: 0,
        dids_estimate: 0,
      };

      return {
        date,
        activeUsers: Math.max(
          card.dids_estimate,
          collection.dids_estimate,
          follow.dids_estimate,
          connection.dids_estimate,
          collectionLink.dids_estimate,
        ),
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
        follows: {
          created: follow.creates,
          updated: follow.updates,
          deleted: follow.deletes,
        },
        connections: {
          created: connection.creates,
          updated: connection.updates,
          deleted: connection.deletes,
        },
        collectionLinks: {
          created: collectionLink.creates,
          updated: collectionLink.updates,
          deleted: collectionLink.deletes,
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
      [
        "network.cosmik.card",
        "network.cosmik.collection",
        "network.cosmik.follow",
        "network.cosmik.connection",
        "network.cosmik.collectionLink",
      ],
      since,
      until,
    );

    const cardStats = stats["network.cosmik.card"];
    const collectionStats = stats["network.cosmik.collection"];
    const followStats = stats["network.cosmik.follow"];
    const connectionStats = stats["network.cosmik.connection"];
    const collectionLinkStats = stats["network.cosmik.collectionLink"];

    // Return the maximum estimate (users may have created cards, collections, and follows)
    return Math.max(
      cardStats?.dids_estimate || 0,
      collectionStats?.dids_estimate || 0,
      followStats?.dids_estimate || 0,
      connectionStats?.dids_estimate || 0,
      collectionLinkStats?.dids_estimate || 0,
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
      [
        "network.cosmik.card",
        "network.cosmik.collection",
        "network.cosmik.follow",
        "network.cosmik.connection",
        "network.cosmik.collectionLink",
      ],
      since,
      until,
    );

    const cardStats = stats["network.cosmik.card"];
    const collectionStats = stats["network.cosmik.collection"];
    const followStats = stats["network.cosmik.follow"];
    const connectionStats = stats["network.cosmik.connection"];
    const collectionLinkStats = stats["network.cosmik.collectionLink"];

    // Return the maximum estimate (users may have created cards, collections, and follows)
    return Math.max(
      cardStats?.dids_estimate || 0,
      collectionStats?.dids_estimate || 0,
      followStats?.dids_estimate || 0,
      connectionStats?.dids_estimate || 0,
      collectionLinkStats?.dids_estimate || 0,
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
      [
        "network.cosmik.card",
        "network.cosmik.collection",
        "network.cosmik.follow",
        "network.cosmik.connection",
        "network.cosmik.collectionLink",
      ],
      startOfToday.toISOString(),
    );

    const cardStats = stats["network.cosmik.card"];
    const collectionStats = stats["network.cosmik.collection"];
    const followStats = stats["network.cosmik.follow"];
    const connectionStats = stats["network.cosmik.connection"];
    const collectionLinkStats = stats["network.cosmik.collectionLink"];

    return Math.max(
      cardStats?.dids_estimate || 0,
      collectionStats?.dids_estimate || 0,
      followStats?.dids_estimate || 0,
      connectionStats?.dids_estimate || 0,
      collectionLinkStats?.dids_estimate || 0,
    );
  }
}
