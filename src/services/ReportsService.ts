/**
 * Reports Service - Generates analytics and reports from activity data
 * Implements Strategy pattern for different report types
 */

import { Activity, TagStats, DailyStats, ReportPeriod } from '@/types';
import { startOfDay, startOfWeek, startOfMonth, isWithinInterval, format } from 'date-fns';
import StorageService from './StorageService';

export class ReportsService {
  private static instance: ReportsService;

  private constructor() {}

  public static getInstance(): ReportsService {
    if (!ReportsService.instance) {
      ReportsService.instance = new ReportsService();
    }
    return ReportsService.instance;
  }

  /**
   * Get activities for a specific period
   */
  getActivitiesForPeriod(period: ReportPeriod): Activity[] {
    const activities = StorageService.loadActivities();
    const now = new Date();

    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'all':
        return activities;
    }

    return activities.filter(activity =>
      isWithinInterval(activity.startTime, { start: startDate, end: now })
    );
  }

  /**
   * Get tag statistics for a period
   */
  getTagStats(period: ReportPeriod): TagStats[] {
    const activities = this.getActivitiesForPeriod(period);
    const tagMap = new Map<string, { totalDuration: number; count: number }>();

    // Aggregate data by tag
    activities.forEach(activity => {
      activity.tags.forEach(tag => {
        const existing = tagMap.get(tag) || { totalDuration: 0, count: 0 };
        tagMap.set(tag, {
          totalDuration: existing.totalDuration + activity.duration,
          count: existing.count + 1,
        });
      });
    });

    // Calculate total duration for percentage
    const totalDuration = Array.from(tagMap.values()).reduce(
      (sum, { totalDuration }) => sum + totalDuration,
      0
    );

    // Convert to array and calculate percentages
    const stats: TagStats[] = Array.from(tagMap.entries()).map(([tag, data]) => ({
      tag,
      totalDuration: data.totalDuration,
      count: data.count,
      percentage: totalDuration > 0 ? (data.totalDuration / totalDuration) * 100 : 0,
    }));

    // Sort by total duration (descending)
    return stats.sort((a, b) => b.totalDuration - a.totalDuration);
  }

  /**
   * Get daily statistics
   */
  getDailyStats(date: Date): DailyStats {
    const startDate = startOfDay(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const activities = StorageService.loadActivities().filter(activity =>
      isWithinInterval(activity.startTime, { start: startDate, end: endDate })
    );

    const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
    const tagStats = this.getTagStatsForActivities(activities);

    return {
      date: format(date, 'yyyy-MM-dd'),
      totalDuration,
      activityCount: activities.length,
      tags: tagStats,
    };
  }

  /**
   * Get tag stats for specific activities
   */
  private getTagStatsForActivities(activities: Activity[]): TagStats[] {
    const tagMap = new Map<string, { totalDuration: number; count: number }>();

    activities.forEach(activity => {
      activity.tags.forEach(tag => {
        const existing = tagMap.get(tag) || { totalDuration: 0, count: 0 };
        tagMap.set(tag, {
          totalDuration: existing.totalDuration + activity.duration,
          count: existing.count + 1,
        });
      });
    });

    const totalDuration = Array.from(tagMap.values()).reduce(
      (sum, { totalDuration }) => sum + totalDuration,
      0
    );

    return Array.from(tagMap.entries())
      .map(([tag, data]) => ({
        tag,
        totalDuration: data.totalDuration,
        count: data.count,
        percentage: totalDuration > 0 ? (data.totalDuration / totalDuration) * 100 : 0,
      }))
      .sort((a, b) => b.totalDuration - a.totalDuration);
  }

  /**
   * Get total time tracked for a period
   */
  getTotalTime(period: ReportPeriod): number {
    const activities = this.getActivitiesForPeriod(period);
    return activities.reduce((sum, activity) => sum + activity.duration, 0);
  }

  /**
   * Get activity count for a period
   */
  getActivityCount(period: ReportPeriod): number {
    return this.getActivitiesForPeriod(period).length;
  }

  /**
   * Search activities
   */
  searchActivities(query: string): Activity[] {
    const activities = StorageService.loadActivities();
    const lowerQuery = query.toLowerCase();

    return activities.filter(activity =>
      activity.description.toLowerCase().includes(lowerQuery) ||
      activity.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Filter activities by tag
   */
  filterByTag(tag: string): Activity[] {
    const activities = StorageService.loadActivities();
    return activities.filter(activity =>
      activity.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  /**
   * Export activities to CSV
   */
  exportToCSV(period: ReportPeriod): string {
    const activities = this.getActivitiesForPeriod(period);

    const headers = ['Date', 'Start Time', 'End Time', 'Duration (minutes)', 'Description', 'Tags'];
    const rows = activities.map(activity => [
      format(activity.startTime, 'yyyy-MM-dd'),
      format(activity.startTime, 'HH:mm:ss'),
      format(activity.endTime, 'HH:mm:ss'),
      (activity.duration / 60000).toFixed(2),
      `"${activity.description.replace(/"/g, '""')}"`,
      `"${activity.tags.join(', ')}"`,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Get timeline data (activities grouped by hour)
   */
  getTimeline(period: ReportPeriod): Array<{ hour: string; activities: Activity[] }> {
    const activities = this.getActivitiesForPeriod(period);
    const hourMap = new Map<string, Activity[]>();

    activities.forEach(activity => {
      const hour = format(activity.startTime, 'yyyy-MM-dd HH:00');
      const existing = hourMap.get(hour) || [];
      hourMap.set(hour, [...existing, activity]);
    });

    return Array.from(hourMap.entries())
      .map(([hour, activities]) => ({ hour, activities }))
      .sort((a, b) => b.hour.localeCompare(a.hour));
  }

  /**
   * Get productivity insights
   */
  getInsights(period: ReportPeriod): {
    mostProductiveTag: string | null;
    totalActivities: number;
    totalTime: number;
    averageSessionDuration: number;
    longestSession: Activity | null;
  } {
    const activities = this.getActivitiesForPeriod(period);
    const tagStats = this.getTagStats(period);

    const totalTime = activities.reduce((sum, a) => sum + a.duration, 0);
    const averageSessionDuration = activities.length > 0 ? totalTime / activities.length : 0;

    const longestSession = activities.reduce<Activity | null>((longest, current) => {
      if (!longest || current.duration > longest.duration) {
        return current;
      }
      return longest;
    }, null);

    return {
      mostProductiveTag: tagStats[0]?.tag || null,
      totalActivities: activities.length,
      totalTime,
      averageSessionDuration,
      longestSession,
    };
  }

  /**
   * Get planned vs actual comparison
   * Compares what was planned in previous activity vs what was actually done
   */
  getPlannedVsActual(period: ReportPeriod): Array<{
    plannedActivity: Activity | null;
    actualActivity: Activity;
    planned: string;
    actual: string;
    matched: boolean;
  }> {
    const activities = this.getActivitiesForPeriod(period)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    const comparisons: Array<{
      plannedActivity: Activity | null;
      actualActivity: Activity;
      planned: string;
      actual: string;
      matched: boolean;
    }> = [];

    for (let i = 1; i < activities.length; i++) {
      const previous = activities[i - 1];
      const current = activities[i];

      if (previous.plannedNext) {
        const planned = previous.plannedNext.toLowerCase().trim();
        const actual = current.description.toLowerCase().trim();

        // Simple matching - check if planned text is in actual description
        const matched = actual.includes(planned) || planned.includes(actual);

        comparisons.push({
          plannedActivity: previous,
          actualActivity: current,
          planned: previous.plannedNext,
          actual: current.description,
          matched,
        });
      }
    }

    return comparisons;
  }
}

export default ReportsService.getInstance();
