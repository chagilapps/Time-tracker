/**
 * Mobile Debug Overlay
 * Shows errors and logs on screen for mobile debugging
 */

import { useEffect, useState } from 'react';

interface LogEntry {
  type: 'log' | 'error' | 'warn';
  message: string;
  timestamp: Date;
}

export default function MobileDebugOverlay() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    setIsVisible(true);

    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      setLogs(prev => [...prev.slice(-10), {
        type: 'log',
        message: args.map(a => String(a)).join(' '),
        timestamp: new Date()
      }]);
    };

    console.error = (...args) => {
      originalError(...args);
      setLogs(prev => [...prev.slice(-10), {
        type: 'error',
        message: args.map(a => String(a)).join(' '),
        timestamp: new Date()
      }]);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      setLogs(prev => [...prev.slice(-10), {
        type: 'warn',
        message: args.map(a => String(a)).join(' '),
        timestamp: new Date()
      }]);
    };

    // Capture unhandled errors
    const errorHandler = (event: ErrorEvent) => {
      setLogs(prev => [...prev.slice(-10), {
        type: 'error',
        message: `Unhandled Error: ${event.message} at ${event.filename}:${event.lineno}`,
        timestamp: new Date()
      }]);
    };

    window.addEventListener('error', errorHandler);

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (!isVisible || logs.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      maxHeight: '40vh',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '10px',
      padding: '10px',
      overflowY: 'auto',
      zIndex: 99999,
      borderTop: '2px solid #4CAF50'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        paddingBottom: '5px',
        borderBottom: '1px solid #666'
      }}>
        <strong>Mobile Debug Console</strong>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: '#f44336',
            color: 'white',
            border: 'none',
            padding: '2px 8px',
            borderRadius: '3px',
            fontSize: '10px'
          }}
        >
          Close
        </button>
      </div>
      {logs.map((log, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: '5px',
            padding: '5px',
            backgroundColor: log.type === 'error' ? '#f443361a' :
                           log.type === 'warn' ? '#ff98001a' :
                           'transparent',
            borderLeft: `3px solid ${
              log.type === 'error' ? '#f44336' :
              log.type === 'warn' ? '#ff9800' :
              '#4CAF50'
            }`,
            paddingLeft: '8px',
            wordBreak: 'break-word'
          }}
        >
          <div style={{ fontSize: '9px', color: '#999', marginBottom: '2px' }}>
            {log.timestamp.toLocaleTimeString()}
          </div>
          <div>{log.message}</div>
        </div>
      ))}
    </div>
  );
}
