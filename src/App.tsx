/**
 * Main App Component
 * Entry point for the Time Tracker application
 */

import { useEffect } from 'react';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import Header from '@/components/Header';
import Tabs from '@/components/Tabs';
import Dashboard from '@/components/Dashboard';
import Reports from '@/components/Reports';
import History from '@/components/History';
import ActivityModal from '@/components/ActivityModal';
import SettingsModal from '@/components/SettingsModal';
import MobileDebugOverlay from '@/components/MobileDebugOverlay';
import './App.css';

function App() {
  const initialize = useTimeTrackerStore(state => state.initialize);
  const currentTab = useTimeTrackerStore(state => state.currentTab);

  useEffect(() => {
    console.log('Time Tracker: Initializing store...');
    console.log('User Agent:', navigator.userAgent);
    console.log('Platform:', navigator.platform);

    try {
      initialize();
      console.log('Time Tracker: Store initialized successfully');
    } catch (error) {
      console.error('Time Tracker: Store initialization failed', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  }, [initialize]);

  console.log('Time Tracker: Rendering App component, currentTab:', currentTab);

  return (
    <div className="app">
      <div className="container">
        <Header />
        <main>
          <Tabs />
          <div className="tab-content-wrapper">
            {currentTab === 'dashboard' && <Dashboard />}
            {currentTab === 'reports' && <Reports />}
            {currentTab === 'history' && <History />}
          </div>
        </main>
        <footer>
          <p>Time Tracker - Track your personal development journey</p>
        </footer>
      </div>

      <ActivityModal />
      <SettingsModal />
      <MobileDebugOverlay />
    </div>
  );
}

export default App;
