/**
 * Notification Service - Handles browser notifications and audio alerts
 * Implements Observer pattern for notification management
 */

import { NotificationOptions } from '@/types';

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private soundEnabled: boolean = true;
  private audioContext: AudioContext | null = null;

  private constructor() {
    this.permission = Notification.permission;
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Get current notification permission
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }

  /**
   * Show a browser notification
   */
  async show(options: NotificationOptions): Promise<Notification | null> {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon.png',
        requireInteraction: options.requireInteraction ?? true,
        tag: 'time-tracker-activity',
      });

      // Play sound if enabled
      if (this.soundEnabled) {
        this.playNotificationSound();
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  /**
   * Set sound enabled/disabled
   */
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  /**
   * Play a notification sound using Web Audio API
   */
  private playNotificationSound(): void {
    try {
      // Create audio context if it doesn't exist
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const context = this.audioContext;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Configure the sound
      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';

      // Fade in and out
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  /**
   * Close all notifications with the app tag
   */
  closeAll(): void {
    // Note: This is limited by browser APIs
    // We can only close notifications we created
  }

  /**
   * Check if notifications are supported
   */
  static isSupported(): boolean {
    return 'Notification' in window;
  }
}

export default NotificationService.getInstance();
