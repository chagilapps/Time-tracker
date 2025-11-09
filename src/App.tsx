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
import './App.css';

function App() {
  const initialize = useTimeTrackerStore(state => state.initialize);
  const currentTab = useTimeTrackerStore(state => state.currentTab);

  useEffect(() => {
    initialize();
  }, [initialize]);

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
    </div>
  );
}

export default App;
