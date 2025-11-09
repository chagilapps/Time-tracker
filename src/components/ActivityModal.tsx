/**
 * Activity Modal Component
 * Modal for entering activity data when notification triggers
 */

import { useState, useEffect, FormEvent } from 'react';
import { useTimeTrackerStore } from '@/store/useTimeTrackerStore';
import TimeTrackingService from '@/services/TimeTrackingService';
import StorageService from '@/services/StorageService';
import { formatTime } from '@/utils/formatters';
import { parseTags } from '@/utils/formatters';
import './ActivityModal.css';

export default function ActivityModal() {
  const showModal = useTimeTrackerStore(state => state.showActivityModal);
  const setShowModal = useTimeTrackerStore(state => state.setShowActivityModal);
  const addActivity = useTimeTrackerStore(state => state.addActivity);
  const skipActivity = useTimeTrackerStore(state => state.skipActivity);

  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [timeSinceLastReport, setTimeSinceLastReport] = useState(0);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    if (showModal) {
      // Load all existing tags for suggestions
      setAllTags(StorageService.getAllTags());

      // Update time every second
      const interval = setInterval(() => {
        const time = TimeTrackingService.getTimeSinceLastNotification();
        setTimeSinceLastReport(time);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showModal]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const tagArray = parseTags(tags);
    addActivity(description, tagArray);
    setDescription('');
    setTags('');
  };

  const handleSkip = () => {
    skipActivity();
    setDescription('');
    setTags('');
  };

  const handleTagClick = (tag: string) => {
    const currentTags = parseTags(tags);
    if (!currentTags.includes(tag)) {
      setTags(currentTags.length > 0 ? `${tags}, ${tag}` : tag);
    }
  };

  if (!showModal) return null;

  return (
    <div className="modal show" onClick={() => setShowModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>What did you do?</h2>
        <p className="time-info">
          Time since last report: <strong>{formatTime(timeSinceLastReport)}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="activityDescription">Activity Description:</label>
            <textarea
              id="activityDescription"
              rows={4}
              placeholder="Describe what you've been doing..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="activityTags">Tags (comma-separated):</label>
            <input
              type="text"
              id="activityTags"
              placeholder="work, coding, meeting, break..."
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
            {allTags.length > 0 && (
              <div className="tag-suggestions">
                {allTags.slice(0, 10).map(tag => (
                  <span
                    key={tag}
                    className="tag-chip"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <button type="button" onClick={handleSkip} className="btn btn-secondary">
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
