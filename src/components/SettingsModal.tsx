/**
 * Settings Modal Component
 * Modal for configuring application settings
 */

import { useState, useEffect } from 'react';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { QuietTime, DayOfWeek } from '@/types';
import { generateId } from '@/utils/formatters';
import './SettingsModal.css';

export default function SettingsModal() {
  const showModal = useTimeTrackerStore(state => state.showSettingsModal);
  const setShowModal = useTimeTrackerStore(state => state.setShowSettingsModal);
  const settings = useTimeTrackerStore(state => state.settings);
  const updateSettings = useTimeTrackerStore(state => state.updateSettings);
  const setNotificationInterval = useTimeTrackerStore(state => state.setNotificationInterval);
  const addQuietTime = useTimeTrackerStore(state => state.addQuietTime);
  const removeQuietTime = useTimeTrackerStore(state => state.removeQuietTime);
  const updateQuietTime = useTimeTrackerStore(state => state.updateQuietTime);
  const requestNotificationPermission = useTimeTrackerStore(
    state => state.requestNotificationPermission
  );

  const [intervalMinutes, setIntervalMinutes] = useState(0);
  const [intervalSeconds, setIntervalSeconds] = useState(15);

  useEffect(() => {
    const totalSeconds = Math.floor(settings.notificationInterval / 1000);
    setIntervalMinutes(Math.floor(totalSeconds / 60));
    setIntervalSeconds(totalSeconds % 60);
  }, [settings.notificationInterval]);

  const handleSaveInterval = () => {
    setNotificationInterval(intervalMinutes, intervalSeconds);
  };

  const handleAddQuietTime = () => {
    const newQuietTime: QuietTime = {
      id: generateId(),
      name: 'New Quiet Time',
      startTime: '22:00',
      endTime: '08:00',
      days: [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[],
      enabled: true,
    };
    addQuietTime(newQuietTime);
  };

  const handleToggleSoundEnabled = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const getPermissionStatus = () => {
    switch (settings.notificationPermission) {
      case 'granted':
        return 'Status: ✅ Enabled';
      case 'denied':
        return 'Status: ❌ Denied';
      default:
        return 'Status: ⚠️ Not enabled';
    }
  };

  const getCurrentInterval = () => {
    const totalSeconds = Math.floor(settings.notificationInterval / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
  };

  if (!showModal) {
    // Show settings button in the header instead
    return null;
  }

  return (
    <div className="modal show" onClick={() => setShowModal(false)}>
      <div className="modal-content settings-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={() => setShowModal(false)}>
            &times;
          </button>
        </div>

        <div className="settings-section">
          <h3>Notification Interval</h3>
          <div className="interval-inputs">
            <div className="form-group">
              <label htmlFor="intervalMinutes">Minutes:</label>
              <input
                type="number"
                id="intervalMinutes"
                min="0"
                max="60"
                value={intervalMinutes}
                onChange={e => setIntervalMinutes(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="intervalSeconds">Seconds:</label>
              <input
                type="number"
                id="intervalSeconds"
                min="15"
                max="59"
                value={intervalSeconds}
                onChange={e => setIntervalSeconds(Number(e.target.value))}
              />
            </div>
          </div>
          <p className="help-text">
            Current interval: <strong>{getCurrentInterval()}</strong>
          </p>
          <button onClick={handleSaveInterval} className="btn btn-primary">
            Save Interval
          </button>
        </div>

        <div className="settings-section">
          <h3>Quiet Time Schedules</h3>
          <div className="quiet-time-list">
            {settings.quietTimes.length === 0 ? (
              <p className="help-text">No quiet times configured</p>
            ) : (
              settings.quietTimes.map(qt => (
                <div key={qt.id} className="quiet-time-item">
                  <div>
                    <strong>{qt.name}</strong>
                    <p className="help-text">
                      {qt.startTime} - {qt.endTime}
                    </p>
                  </div>
                  <div className="quiet-time-controls">
                    <label>
                      <input
                        type="checkbox"
                        checked={qt.enabled}
                        onChange={e =>
                          updateQuietTime(qt.id, { enabled: e.target.checked })
                        }
                      />
                      Enabled
                    </label>
                    <button
                      onClick={() => removeQuietTime(qt.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <button onClick={handleAddQuietTime} className="btn btn-secondary">
            + Add Quiet Time
          </button>
        </div>

        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={handleToggleSoundEnabled}
              />
              Enable notification sound
            </label>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="btn btn-secondary"
          >
            Enable Browser Notifications
          </button>
          <p className="help-text">{getPermissionStatus()}</p>
        </div>
      </div>
    </div>
  );
}
