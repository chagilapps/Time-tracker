/**
 * Core domain types for the Time Tracker application
 */

export interface Activity {
  id: string;
  description: string;
  tags: string[];
  plannedNext?: string; // What you plan to do in next interval
  mood?: number; // 1-5 satisfaction/feeling level
  excuse?: string; // Reason/excuse if not productive
  startTime: Date;
  endTime: Date;
  duration: number; // in milliseconds
  createdAt: Date;
}

export interface QuietTime {
  id: string;
  name: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  days: DayOfWeek[];
  enabled: boolean;
}

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

export interface Settings {
  notificationInterval: number; // in milliseconds
  soundEnabled: boolean;
  notificationPermission: NotificationPermission;
  quietTimes: QuietTime[];
}

export interface AppState {
  isTracking: boolean;
  isQuietMode: boolean;
  currentSessionStart: Date | null;
  lastNotificationTime: Date | null;
  activities: Activity[];
  settings: Settings;
}

export interface TagStats {
  tag: string;
  totalDuration: number;
  count: number;
  percentage: number;
}

export interface DailyStats {
  date: string;
  totalDuration: number;
  activityCount: number;
  tags: TagStats[];
}

export type ReportPeriod = 'today' | 'week' | 'month' | 'all';

export type TabType = 'dashboard' | 'reports' | 'history';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  requireInteraction?: boolean;
}
