/**
 * Time Tracking Service - Core business logic for time tracking
 * Implements Service pattern with event-driven architecture
 */

import { Activity, QuietTime, DayOfWeek } from '@/types';
import StorageService from './StorageService';
import NotificationService from './NotificationService';

export type TimeTrackingEventType = 'notification-due' | 'session-started' | 'session-stopped' | 'activity-added';

export interface TimeTrackingEvent {
  type: TimeTrackingEventType;
  data?: any;
}

type EventListener = (event: TimeTrackingEvent) => void;

export class TimeTrackingService {
  private static instance: TimeTrackingService;
  private timerId: number | null = null;
  private sessionStartTime: Date | null = null;
  private lastNotificationTime: Date | null = null;
  private notificationInterval: number = 15000; // 15 seconds default
  private listeners: EventListener[] = [];
  private isQuietMode: boolean = false;
  private quietTimes: QuietTime[] = [];

  private constructor() {
    this.loadSessionIfExists();
  }

  public static getInstance(): TimeTrackingService {
    if (!TimeTrackingService.instance) {
      TimeTrackingService.instance = new TimeTrackingService();
    }
    return TimeTrackingService.instance;
  }

  /**
   * Add event listener
   */
  addEventListener(listener: EventListener): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: TimeTrackingEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Start tracking session
   */
  startTracking(): void {
    if (this.timerId !== null) {
      console.warn('Tracking already started');
      return;
    }

    this.sessionStartTime = new Date();
    this.lastNotificationTime = new Date();

    // Save session to storage
    StorageService.saveSession({
      start: this.sessionStartTime,
      lastNotification: this.lastNotificationTime,
    });

    // Start the notification timer
    this.timerId = window.setInterval(() => {
      this.checkForNotification();
    }, 1000); // Check every second

    this.emit({ type: 'session-started' });
  }

  /**
   * Stop tracking session
   */
  stopTracking(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    this.sessionStartTime = null;
    this.lastNotificationTime = null;
    StorageService.clearSession();

    this.emit({ type: 'session-stopped' });
  }

  /**
   * Check if notification should be shown
   */
  private checkForNotification(): void {
    if (!this.lastNotificationTime) return;
    if (this.isInQuietTime()) return;
    if (this.isQuietMode) return;

    const now = new Date();
    const timeSinceLastNotification = now.getTime() - this.lastNotificationTime.getTime();

    if (timeSinceLastNotification >= this.notificationInterval) {
      this.triggerNotification();
    }
  }

  /**
   * Trigger a notification
   */
  private async triggerNotification(): Promise<void> {
    this.lastNotificationTime = new Date();

    // Update storage
    if (this.sessionStartTime) {
      StorageService.saveSession({
        start: this.sessionStartTime,
        lastNotification: this.lastNotificationTime,
      });
    }

    // Show browser notification
    await NotificationService.show({
      title: 'Time Tracker',
      body: 'What have you been doing? Time to log your activity!',
      requireInteraction: true,
    });

    // Emit event for UI to show modal
    this.emit({ type: 'notification-due' });
  }

  /**
   * Add a new activity
   */
  addActivity(description: string, tags: string[], plannedNext?: string, mood?: number, excuse?: string): Activity {
    if (!this.sessionStartTime || !this.lastNotificationTime) {
      throw new Error('No active session');
    }

    const now = new Date();
    const previousNotificationTime = new Date(
      this.lastNotificationTime.getTime() - this.notificationInterval
    );

    const activity: Activity = {
      id: this.generateId(),
      description,
      tags,
      plannedNext,
      mood,
      excuse,
      startTime: previousNotificationTime,
      endTime: this.lastNotificationTime,
      duration: this.notificationInterval,
      createdAt: now,
    };

    StorageService.addActivity(activity);
    this.emit({ type: 'activity-added', data: activity });

    return activity;
  }

  /**
   * Set notification interval
   */
  setNotificationInterval(milliseconds: number): void {
    if (milliseconds < 1000) {
      throw new Error('Interval must be at least 1 second');
    }
    this.notificationInterval = milliseconds;
  }

  /**
   * Get current notification interval
   */
  getNotificationInterval(): number {
    return this.notificationInterval;
  }

  /**
   * Set quiet mode
   */
  setQuietMode(enabled: boolean): void {
    this.isQuietMode = enabled;
  }

  /**
   * Get quiet mode status
   */
  getQuietMode(): boolean {
    return this.isQuietMode;
  }

  /**
   * Set quiet times
   */
  setQuietTimes(quietTimes: QuietTime[]): void {
    this.quietTimes = quietTimes;
  }

  /**
   * Check if current time is in a quiet time period
   */
  private isInQuietTime(): boolean {
    const now = new Date();
    const currentDay = now.getDay() as DayOfWeek;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return this.quietTimes.some(qt => {
      if (!qt.enabled) return false;
      if (!qt.days.includes(currentDay)) return false;

      // Check if current time is within the quiet time range
      return currentTime >= qt.startTime && currentTime <= qt.endTime;
    });
  }

  /**
   * Get session info
   */
  getSessionInfo(): {
    isActive: boolean;
    startTime: Date | null;
    lastNotificationTime: Date | null;
    duration: number;
  } {
    const duration = this.sessionStartTime
      ? new Date().getTime() - this.sessionStartTime.getTime()
      : 0;

    return {
      isActive: this.timerId !== null,
      startTime: this.sessionStartTime,
      lastNotificationTime: this.lastNotificationTime,
      duration,
    };
  }

  /**
   * Get time since last notification
   */
  getTimeSinceLastNotification(): number {
    if (!this.lastNotificationTime) return 0;
    return new Date().getTime() - this.lastNotificationTime.getTime();
  }

  /**
   * Load session from storage if exists (for page refresh)
   */
  private loadSessionIfExists(): void {
    const session = StorageService.loadSession();
    if (session) {
      // Check if session is still recent (within last hour)
      const timeSinceStart = new Date().getTime() - session.start.getTime();
      if (timeSinceStart < 3600000) { // 1 hour
        this.sessionStartTime = session.start;
        this.lastNotificationTime = session.lastNotification;
      } else {
        StorageService.clearSession();
      }
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Skip current notification (extend time)
   */
  skipNotification(): void {
    this.lastNotificationTime = new Date();
    if (this.sessionStartTime) {
      StorageService.saveSession({
        start: this.sessionStartTime,
        lastNotification: this.lastNotificationTime,
      });
    }
  }
}

export default TimeTrackingService.getInstance();
