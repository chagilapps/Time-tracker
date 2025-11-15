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
  const [plannedNext, setPlannedNext] = useState('');
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [excuse, setExcuse] = useState('');
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
    addActivity(description, tagArray, plannedNext, mood, excuse);
    // Reset form
    setDescription('');
    setTags('');
    setPlannedNext('');
    setMood(undefined);
    setExcuse('');
  };

  const handleSkip = () => {
    skipActivity();
    // Reset form
    setDescription('');
    setTags('');
    setPlannedNext('');
    setMood(undefined);
    setExcuse('');
  };

  const handleTagClick = (tag: string) => {
    const currentTags = parseTags(tags);
    if (!currentTags.includes(tag)) {
      setTags(currentTags.length > 0 ? `${tags}, ${tag}` : tag);
    }
  };

  const getMoodEmoji = (level: number): string => {
    const emojis = ['😢', '😕', '😐', '😊', '😄'];
    return emojis[level - 1] || '😐';
  };

  const getMoodLabel = (level: number): string => {
    const labels = ['Very Bad', 'Not Great', 'Okay', 'Good', 'Excellent'];
    return labels[level - 1] || 'Okay';
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

          <div className="form-group">
            <label htmlFor="plannedNext">What are you up to next? (Optional):</label>
            <input
              type="text"
              id="plannedNext"
              placeholder="Plan for next interval..."
              value={plannedNext}
              onChange={e => setPlannedNext(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>How did you feel during this time?</label>
            <div className="mood-selector">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  type="button"
                  className={`mood-btn ${mood === level ? 'selected' : ''}`}
                  onClick={() => setMood(level)}
                  title={getMoodLabel(level)}
                >
                  {getMoodEmoji(level)}
                </button>
              ))}
            </div>
            {mood && <p className="mood-label">{getMoodLabel(mood)}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="excuse">Any excuse/reason? (Optional):</label>
            <input
              type="text"
              id="excuse"
              placeholder="e.g., I was tired, had an urgent call..."
              value={excuse}
              onChange={e => setExcuse(e.target.value)}
            />
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
