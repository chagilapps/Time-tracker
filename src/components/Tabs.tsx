/**
 * Tabs Component
 * Navigation between different views
 */

import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { TabType } from '@/types';
import './Tabs.css';

export default function Tabs() {
  const currentTab = useTimeTrackerStore(state => state.currentTab);
  const setCurrentTab = useTimeTrackerStore(state => state.setCurrentTab);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'reports', label: 'Reports' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${currentTab === tab.id ? 'active' : ''}`}
          onClick={() => setCurrentTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
