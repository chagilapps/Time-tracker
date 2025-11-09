/**
 * Application Entry Point
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './index.css'

console.log('Time Tracker: Starting application...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  // Notify that React is loading
  if (typeof (window as any).reactLoaded === 'function') {
    (window as any).reactLoaded();
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );

  console.log('Time Tracker: Application rendered successfully');
} catch (error) {
  console.error('Time Tracker: Failed to start application', error);

  // Show error on screen
  const errorDisplay = document.getElementById('error-display');
  if (errorDisplay) {
    errorDisplay.style.display = 'block';
    errorDisplay.innerHTML = `<strong>React Error:</strong><br>${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; font-family: system-ui;">
      <h1 style="color: #f44336;">Failed to Load Application</h1>
      <p style="color: #666;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      <p style="font-size: 12px; color: #999; margin-top: 10px;">${error instanceof Error && error.stack ? error.stack : ''}</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 20px;">
        Reload Page
      </button>
    </div>
  `;
}
