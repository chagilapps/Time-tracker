/**
 * Dashboard Component
 * Main dashboard view with stats and recent activities
 */

import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import { useTimeSince } from '@/hooks/useTimeSince';
import ReportsService from '@/services/ReportsService';
import { formatDuration, formatTime, formatDateTime } from '@/utils/formatters';
import './Dashboard.css';

export default function Dashboard() {
  const isTracking = useTimeTrackerStore(state => state.isTracking);
  const sessionStartTime = useTimeTrackerStore(state => state.sessionStartTime);
  const activities = useTimeTrackerStore(state => state.activities);

  const sessionDuration = useTimeSince(sessionStartTime);

  // Get today's stats
  const todayActivities = ReportsService.getActivitiesForPeriod('today');
  const todayDuration = ReportsService.getTotalTime('today');

  // Get recent activities (last 10)
  const recentActivities = [...activities]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Today's Entries</h3>
          <p className="stat-value">{todayActivities.length}</p>
        </div>
        <div className="stat-card">
          <h3>Time Tracked Today</h3>
          <p className="stat-value">{formatDuration(todayDuration)}</p>
        </div>
        <div className="stat-card">
          <h3>Current Session</h3>
          <p className="stat-value">
            {isTracking ? formatTime(sessionDuration) : 'Not tracking'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Status</h3>
          <p className="stat-value" style={{ fontSize: '20px' }}>
            {isTracking ? '🟢 Active' : '⚪ Idle'}
          </p>
        </div>
      </div>

      <div className="recent-activities">
        <h3>Recent Activities</h3>
        <div className="activities-list">
          {recentActivities.length === 0 ? (
            <div className="empty-state">
              <p>No activities yet. Start tracking to see your activities here!</p>
            </div>
          ) : (
            recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-item-header">
                  <span className="activity-time">
                    {formatDateTime(activity.startTime)}
                  </span>
                  <span className="activity-duration">
                    {formatDuration(activity.duration)}
                  </span>
                </div>
                <div className="activity-item-description">
                  {activity.description}
                </div>
                {activity.tags.length > 0 && (
                  <div className="activity-item-tags">
                    {activity.tags.map((tag, idx) => (
                      <span key={idx} className="activity-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
