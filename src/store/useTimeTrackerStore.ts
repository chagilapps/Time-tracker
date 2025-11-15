/**
 * Zustand Store - Global state management
 * Implements Flux pattern with Zustand
 */

import { create } from 'zustand';
import { Activity, Settings, QuietTime, TabType } from '@/types';
import TimeTrackingService from '@/services/TimeTrackingService';
import NotificationService from '@/services/NotificationService';
import StorageService from '@/services/StorageService';

interface TimeTrackerState {
  // Tracking state
  isTracking: boolean;
  isQuietMode: boolean;
  isStopping: boolean; // Flag to indicate stop tracking in progress
  sessionStartTime: Date | null;
  lastNotificationTime: Date | null;
  showActivityModal: boolean;
  showSettingsModal: boolean;

  // UI state
  currentTab: TabType;

  // Data
  activities: Activity[];
  settings: Settings;

  // Actions
  startTracking: () => void;
  stopTracking: () => void;
  finalizeStopTracking: () => void;
  toggleQuietMode: () => void;
  addActivity: (description: string, tags: string[], plannedNext?: string, mood?: number, excuse?: string) => void;
  skipActivity: () => void;

  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void;
  setNotificationInterval: (minutes: number, seconds: number) => void;
  addQuietTime: (quietTime: QuietTime) => void;
  removeQuietTime: (id: string) => void;
  updateQuietTime: (id: string, updates: Partial<QuietTime>) => void;
  requestNotificationPermission: () => Promise<void>;

  // UI actions
  setShowActivityModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  setCurrentTab: (tab: TabType) => void;

  // Data actions
  loadActivities: () => void;
  deleteActivity: (id: string) => void;

  // Initialization
  initialize: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  notificationInterval: 15000, // 15 seconds
  soundEnabled: true,
  notificationPermission: 'default',
  quietTimes: [],
};

export const useTimeTrackerStore = create<TimeTrackerState>((set, get) => ({
  // Initial state
  isTracking: false,
  isQuietMode: false,
  isStopping: false,
  sessionStartTime: null,
  lastNotificationTime: null,
  showActivityModal: false,
  showSettingsModal: false,
  currentTab: 'dashboard',
  activities: [],
  settings: DEFAULT_SETTINGS,

  // Actions
  startTracking: () => {
    const { settings } = get();
    TimeTrackingService.setNotificationInterval(settings.notificationInterval);
    TimeTrackingService.setQuietTimes(settings.quietTimes);
    TimeTrackingService.startTracking();

    const sessionInfo = TimeTrackingService.getSessionInfo();
    set({
      isTracking: true,
      sessionStartTime: sessionInfo.startTime,
      lastNotificationTime: sessionInfo.lastNotificationTime,
    });
  },

  stopTracking: () => {
    // Show activity modal first to log what they did
    set({ showActivityModal: true, isStopping: true });
    // Note: Actual stopping happens after they submit or skip in the modal
  },

  finalizeStopTracking: () => {
    TimeTrackingService.stopTracking();
    set({
      isTracking: false,
      isStopping: false,
      sessionStartTime: null,
      lastNotificationTime: null,
      showActivityModal: false,
    });
  },

  toggleQuietMode: () => {
    const { isQuietMode } = get();
    const newMode = !isQuietMode;
    TimeTrackingService.setQuietMode(newMode);
    set({ isQuietMode: newMode });
  },

  addActivity: (description: string, tags: string[], plannedNext?: string, mood?: number, excuse?: string) => {
    try {
      TimeTrackingService.addActivity(description, tags, plannedNext, mood, excuse);
      const activities = StorageService.loadActivities();

      // Check if we need to finalize stopping
      const { isStopping } = get();
      if (isStopping) {
        // User submitted activity while stopping - finalize the stop
        get().finalizeStopTracking();
      } else {
        // Normal activity logging
        set({ activities, showActivityModal: false });
      }
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  },

  skipActivity: () => {
    try {
      // Create a skipped activity record
      TimeTrackingService.addActivity('Activity skipped', [':skipped']);
      const activities = StorageService.loadActivities();

      // Check if we need to finalize stopping
      const { isStopping } = get();
      if (isStopping) {
        // User skipped while stopping - finalize the stop
        get().finalizeStopTracking();
      } else {
        // Normal skip
        set({ activities, showActivityModal: false });
      }
    } catch (error) {
      console.error('Error skipping activity:', error);
      // Just close the modal if there's an error
      set({ showActivityModal: false });
    }
  },

  updateSettings: (updates: Partial<Settings>) => {
    const { settings } = get();
    const newSettings = { ...settings, ...updates };
    StorageService.saveSettings(newSettings);

    // Apply settings to services
    TimeTrackingService.setNotificationInterval(newSettings.notificationInterval);
    TimeTrackingService.setQuietTimes(newSettings.quietTimes);
    NotificationService.setSoundEnabled(newSettings.soundEnabled);

    set({ settings: newSettings });
  },

  setNotificationInterval: (minutes: number, seconds: number) => {
    const milliseconds = (minutes * 60 + seconds) * 1000;
    const { settings } = get();
    const newSettings = { ...settings, notificationInterval: milliseconds };
    StorageService.saveSettings(newSettings);
    TimeTrackingService.setNotificationInterval(milliseconds);
    set({ settings: newSettings });
  },

  addQuietTime: (quietTime: QuietTime) => {
    const { settings } = get();
    const newQuietTimes = [...settings.quietTimes, quietTime];
    const newSettings = { ...settings, quietTimes: newQuietTimes };
    StorageService.saveSettings(newSettings);
    TimeTrackingService.setQuietTimes(newQuietTimes);
    set({ settings: newSettings });
  },

  removeQuietTime: (id: string) => {
    const { settings } = get();
    const newQuietTimes = settings.quietTimes.filter(qt => qt.id !== id);
    const newSettings = { ...settings, quietTimes: newQuietTimes };
    StorageService.saveSettings(newSettings);
    TimeTrackingService.setQuietTimes(newQuietTimes);
    set({ settings: newSettings });
  },

  updateQuietTime: (id: string, updates: Partial<QuietTime>) => {
    const { settings } = get();
    const newQuietTimes = settings.quietTimes.map(qt =>
      qt.id === id ? { ...qt, ...updates } : qt
    );
    const newSettings = { ...settings, quietTimes: newQuietTimes };
    StorageService.saveSettings(newSettings);
    TimeTrackingService.setQuietTimes(newQuietTimes);
    set({ settings: newSettings });
  },

  requestNotificationPermission: async () => {
    const permission = await NotificationService.requestPermission();
    const { settings } = get();
    const newSettings = { ...settings, notificationPermission: permission };
    StorageService.saveSettings(newSettings);
    set({ settings: newSettings });
  },

  setShowActivityModal: (show: boolean) => {
    set({ showActivityModal: show });
  },

  setShowSettingsModal: (show: boolean) => {
    set({ showSettingsModal: show });
  },

  setCurrentTab: (tab: TabType) => {
    set({ currentTab: tab });
  },

  loadActivities: () => {
    const activities = StorageService.loadActivities();
    set({ activities });
  },

  deleteActivity: (id: string) => {
    StorageService.deleteActivity(id);
    const activities = StorageService.loadActivities();
    set({ activities });
  },

  initialize: () => {
    console.log('Store: Starting initialization...');

    try {
      // Load settings with error handling
      console.log('Store: Loading settings...');
      const savedSettings = StorageService.loadSettings();
      const settings = savedSettings || DEFAULT_SETTINGS;

      // Update notification permission from browser (mobile-safe)
      try {
        if ('Notification' in window && typeof Notification !== 'undefined') {
          settings.notificationPermission = NotificationService.getPermission();
        } else {
          console.log('Store: Notifications not supported on this device');
          settings.notificationPermission = 'denied';
        }
      } catch (err) {
        console.warn('Store: Could not check notification permission', err);
        settings.notificationPermission = 'denied';
      }

      StorageService.saveSettings(settings);
      console.log('Store: Settings loaded successfully');

      // Load activities with error handling
      console.log('Store: Loading activities...');
      const activities = StorageService.loadActivities();
      console.log(`Store: Loaded ${activities.length} activities`);

      // Check if there's a session in progress
      console.log('Store: Checking for active session...');
      const sessionInfo = TimeTrackingService.getSessionInfo();
      const isTracking = sessionInfo.isActive;
      console.log(`Store: Active session: ${isTracking}`);

      if (isTracking) {
        // Resume tracking
        console.log('Store: Resuming active session...');
        TimeTrackingService.setNotificationInterval(settings.notificationInterval);
        TimeTrackingService.setQuietTimes(settings.quietTimes);
        NotificationService.setSoundEnabled(settings.soundEnabled);
      }

      // Set up event listener for notifications
      console.log('Store: Setting up event listeners...');
      TimeTrackingService.addEventListener(event => {
        if (event.type === 'notification-due') {
          set({ showActivityModal: true });
        } else if (event.type === 'session-started') {
          const sessionInfo = TimeTrackingService.getSessionInfo();
          set({
            isTracking: true,
            sessionStartTime: sessionInfo.startTime,
            lastNotificationTime: sessionInfo.lastNotificationTime,
          });
        } else if (event.type === 'session-stopped') {
          set({
            isTracking: false,
            sessionStartTime: null,
            lastNotificationTime: null,
          });
        } else if (event.type === 'activity-added') {
          get().loadActivities();
        }
      });

      console.log('Store: Setting initial state...');
      set({
        settings,
        activities,
        isTracking,
        sessionStartTime: sessionInfo.startTime,
        lastNotificationTime: sessionInfo.lastNotificationTime,
      });

      console.log('Store: Initialization complete!');
    } catch (error) {
      console.error('Store: Initialization failed', error);
      // Set safe defaults on error
      set({
        settings: DEFAULT_SETTINGS,
        activities: [],
        isTracking: false,
        sessionStartTime: null,
        lastNotificationTime: null,
      });
      throw error; // Re-throw to be caught by error boundary
    }
  },
}));
