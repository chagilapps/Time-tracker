/**
 * Reports Component
 * Analytics and reports view
 */

import { useState } from 'react';
import { ReportPeriod } from '@/types';
import ReportsService from '@/services/ReportsService';
import { formatDuration, downloadFile } from '@/utils/formatters';
import './Reports.css';

export default function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>('today');

  const tagStats = ReportsService.getTagStats(period);
  const timeline = ReportsService.getTimeline(period);
  const insights = ReportsService.getInsights(period);
  const plannedVsActual = ReportsService.getPlannedVsActual(period);

  const handleExport = () => {
    const csv = ReportsService.exportToCSV(period);
    const filename = `time-tracker-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csv, filename, 'text/csv');
  };

  const maxDuration = tagStats.length > 0 ? tagStats[0].totalDuration : 1;

  return (
    <div className="reports">
      <div className="report-filters">
        <select value={period} onChange={e => setPeriod(e.target.value as ReportPeriod)}>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
        <button onClick={handleExport} className="btn btn-secondary">
          Export CSV
        </button>
      </div>

      <div className="insights-section">
        <h3>Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <span className="insight-label">Total Activities</span>
            <span className="insight-value">{insights.totalActivities}</span>
          </div>
          <div className="insight-card">
            <span className="insight-label">Total Time</span>
            <span className="insight-value">{formatDuration(insights.totalTime)}</span>
          </div>
          <div className="insight-card">
            <span className="insight-label">Average Duration</span>
            <span className="insight-value">
              {formatDuration(insights.averageSessionDuration)}
            </span>
          </div>
          <div className="insight-card">
            <span className="insight-label">Most Used Tag</span>
            <span className="insight-value">{insights.mostProductiveTag || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3>Time by Tag</h3>
        {tagStats.length === 0 ? (
          <div className="empty-state">
            <p>No data available for this period</p>
          </div>
        ) : (
          <div className="tag-report">
            {tagStats.map(stat => (
              <div key={stat.tag} className="tag-report-item">
                <div className="tag-report-header">
                  <span className="tag-report-name">{stat.tag}</span>
                  <span className="tag-report-stats">
                    {formatDuration(stat.totalDuration)} ({stat.count} activities)
                  </span>
                </div>
                <div className="tag-report-bar-container">
                  <div
                    className="tag-report-bar"
                    style={{ width: `${(stat.totalDuration / maxDuration) * 100}%` }}
                  />
                </div>
                <div className="tag-report-percentage">{stat.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="report-section">
        <h3>Planned vs Actual</h3>
        <p className="help-text" style={{ marginBottom: '15px' }}>
          Compare what you planned to do with what you actually did
        </p>
        {plannedVsActual.length === 0 ? (
          <div className="empty-state">
            <p>No planned activities to compare</p>
          </div>
        ) : (
          <div className="planned-vs-actual-list">
            {plannedVsActual.map((comparison, idx) => (
              <div key={idx} className={`comparison-item ${comparison.matched ? 'matched' : 'not-matched'}`}>
                <div className="comparison-header">
                  <span className={`comparison-status ${comparison.matched ? 'status-success' : 'status-warning'}`}>
                    {comparison.matched ? '✓ Matched' : '✗ Different'}
                  </span>
                </div>
                <div className="comparison-content">
                  <div className="comparison-row">
                    <div className="comparison-label">📝 Planned:</div>
                    <div className="comparison-value planned">{comparison.planned}</div>
                  </div>
                  <div className="comparison-row">
                    <div className="comparison-label">✅ Actual:</div>
                    <div className="comparison-value actual">{comparison.actual}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="report-section">
        <h3>Activity Timeline</h3>
        {timeline.length === 0 ? (
          <div className="empty-state">
            <p>No activities for this period</p>
          </div>
        ) : (
          <div className="timeline-report">
            {timeline.map(({ hour, activities }) => (
              <div key={hour} className="timeline-item">
                <div className="timeline-time">{hour}</div>
                <div className="timeline-activities">
                  {activities.map(activity => (
                    <div key={activity.id} className="timeline-activity">
                      <div className="timeline-activity-description">
                        {activity.description}
                      </div>
                      <div className="timeline-activity-duration">
                        {formatDuration(activity.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
