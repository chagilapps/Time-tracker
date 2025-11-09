/**
 * Storage Service - Handles all localStorage operations with type safety
 * Implements Repository pattern for data persistence
 */

import { Activity, Settings } from '@/types';

const STORAGE_KEYS = {
  ACTIVITIES: 'timetracker_activities',
  SETTINGS: 'timetracker_settings',
  SESSION: 'timetracker_session',
} as const;

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Save activities to localStorage
   */
  saveActivities(activities: Activity[]): void {
    try {
      const serialized = JSON.stringify(activities, (_key, value) => {
        // Convert Date objects to ISO strings
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      });
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, serialized);
    } catch (error) {
      console.error('Error saving activities:', error);
      throw new Error('Failed to save activities');
    }
  }

  /**
   * Load activities from localStorage
   */
  loadActivities(): Activity[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (!data) return [];

      const parsed = JSON.parse(data);
      // Convert ISO strings back to Date objects
      return parsed.map((activity: any) => ({
        ...activity,
        startTime: new Date(activity.startTime),
        endTime: new Date(activity.endTime),
        createdAt: new Date(activity.createdAt),
      }));
    } catch (error) {
      console.error('Error loading activities:', error);
      return [];
    }
  }

  /**
   * Add a new activity
   */
  addActivity(activity: Activity): void {
    const activities = this.loadActivities();
    activities.push(activity);
    this.saveActivities(activities);
  }

  /**
   * Delete an activity by ID
   */
  deleteActivity(id: string): void {
    const activities = this.loadActivities();
    const filtered = activities.filter(a => a.id !== id);
    this.saveActivities(filtered);
  }

  /**
   * Update an existing activity
   */
  updateActivity(id: string, updates: Partial<Activity>): void {
    const activities = this.loadActivities();
    const index = activities.findIndex(a => a.id === id);
    if (index !== -1) {
      activities[index] = { ...activities[index], ...updates };
      this.saveActivities(activities);
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * Load settings from localStorage
   */
  loadSettings(): Settings | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading settings:', error);
      return null;
    }
  }

  /**
   * Save session data
   */
  saveSession(sessionData: { start: Date; lastNotification: Date }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({
        start: sessionData.start.toISOString(),
        lastNotification: sessionData.lastNotification.toISOString(),
      }));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  /**
   * Load session data
   */
  loadSession(): { start: Date; lastNotification: Date } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!data) return null;

      const parsed = JSON.parse(data);
      return {
        start: new Date(parsed.start),
        lastNotification: new Date(parsed.lastNotification),
      };
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  /**
   * Get all unique tags from activities
   */
  getAllTags(): string[] {
    const activities = this.loadActivities();
    const tagSet = new Set<string>();
    activities.forEach(activity => {
      activity.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }

  /**
   * Clear all data (useful for debugging or reset)
   */
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Export all data as JSON
   */
  exportData(): string {
    const activities = this.loadActivities();
    const settings = this.loadSettings();
    return JSON.stringify({ activities, settings }, null, 2);
  }

  /**
   * Import data from JSON
   */
  importData(jsonData: string): void {
    try {
      const { activities, settings } = JSON.parse(jsonData);
      if (activities) {
        const parsedActivities = activities.map((activity: any) => ({
          ...activity,
          startTime: new Date(activity.startTime),
          endTime: new Date(activity.endTime),
          createdAt: new Date(activity.createdAt),
        }));
        this.saveActivities(parsedActivities);
      }
      if (settings) {
        this.saveSettings(settings);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }
}

export default StorageService.getInstance();
