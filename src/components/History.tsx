/**
 * History Component
 * View and search activity history
 */

import { useState, useMemo } from 'react';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import ReportsService from '@/services/ReportsService';
import { formatDuration, formatDateTime } from '@/utils/formatters';
import './History.css';

export default function History() {
  const activities = useTimeTrackerStore(state => state.activities);
  const deleteActivity = useTimeTrackerStore(state => state.deleteActivity);

  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Search filter
    if (searchQuery) {
      filtered = ReportsService.searchActivities(searchQuery);
    }

    // Tag filter
    if (tagFilter) {
      filtered = filtered.filter(activity =>
        activity.tags.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()))
      );
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.startTime);
        return (
          activityDate.getFullYear() === filterDate.getFullYear() &&
          activityDate.getMonth() === filterDate.getMonth() &&
          activityDate.getDate() === filterDate.getDate()
        );
      });
    }

    // Sort by newest first
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [activities, searchQuery, tagFilter, dateFilter]);

  return (
    <div className="history">
      <div className="history-filters">
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          placeholder="Filter by date"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search activities..."
        />
        <input
          type="text"
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
          placeholder="Filter by tag..."
        />
      </div>

      <div className="history-list">
        {filteredActivities.length === 0 ? (
          <div className="empty-state">
            <p>No activities found</p>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div key={activity.id} className="history-item">
              <div className="history-item-header">
                <span className="history-item-time">
                  {formatDateTime(activity.startTime)}
                </span>
                <span className="history-item-duration">
                  {formatDuration(activity.duration)}
                </span>
              </div>
              <div className="history-item-description">{activity.description}</div>
              {activity.tags.length > 0 && (
                <div className="history-item-tags">
                  {activity.tags.map((tag, idx) => (
                    <span key={idx} className="activity-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => deleteActivity(activity.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
