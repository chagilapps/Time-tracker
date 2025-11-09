/**
 * Header Component
 * Main navigation and control buttons
 */

import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import './Header.css';

export default function Header() {
  const isTracking = useTimeTrackerStore(state => state.isTracking);
  const isQuietMode = useTimeTrackerStore(state => state.isQuietMode);
  const startTracking = useTimeTrackerStore(state => state.startTracking);
  const stopTracking = useTimeTrackerStore(state => state.stopTracking);
  const toggleQuietMode = useTimeTrackerStore(state => state.toggleQuietMode);
  const setShowSettingsModal = useTimeTrackerStore(state => state.setShowSettingsModal);

  return (
    <header>
      <h1>⏱️ Time Tracker</h1>
      <div className="header-controls">
        <button
          onClick={startTracking}
          disabled={isTracking}
          className={`btn btn-primary ${isTracking ? 'tracking-active' : ''}`}
        >
          {isTracking ? 'Tracking...' : 'Start Tracking'}
        </button>
        <button
          onClick={stopTracking}
          disabled={!isTracking}
          className="btn btn-secondary"
        >
          Stop Tracking
        </button>
        <button
          onClick={toggleQuietMode}
          className={`btn btn-quiet ${isQuietMode ? 'active' : ''}`}
        >
          Quiet Mode: {isQuietMode ? 'On' : 'Off'}
        </button>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="btn btn-icon"
          title="Settings"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
}
