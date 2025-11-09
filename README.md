# Time Tracker - Personal Development

A modern time tracking application built with React, TypeScript, and best practices. Track your activities, analyze your productivity, and improve your time management.

## Features

- **Periodic Notifications**: Get notified at custom intervals (default: 15 seconds, configurable) to log what you've been doing
- **Activity Logging**: Quick form to capture what you did with tags for categorization
- **Quiet Time**: Set do-not-disturb periods (e.g., sleep, meetings) when you don't want notifications
- **Dashboard**: Real-time view of your current session and today's statistics
- **Reports**: Analyze your time by tags, view timelines, and export data to CSV
- **History**: Search and filter all your logged activities
- **Offline-First**: All data stored locally using localStorage
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

The application follows industry best practices and design patterns:

### Design Patterns
- **Singleton Pattern**: Services (StorageService, NotificationService, TimeTrackingService)
- **Observer Pattern**: Event-driven notifications system
- **Repository Pattern**: Data persistence abstraction
- **Service Layer**: Business logic separated from UI
- **Flux Pattern**: State management with Zustand

### Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx
│   ├── Tabs.tsx
│   ├── Dashboard.tsx
│   ├── Reports.tsx
│   ├── History.tsx
│   ├── ActivityModal.tsx
│   └── SettingsModal.tsx
├── hooks/              # Custom React hooks
│   ├── useInterval.ts
│   └── useTimeSince.ts
├── services/           # Business logic layer
│   ├── StorageService.ts
│   ├── NotificationService.ts
│   ├── TimeTrackingService.ts
│   └── ReportsService.ts
├── store/              # State management
│   └── useTimeTrackerStore.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── formatters.ts
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Time-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Open your browser to the URL shown (typically http://localhost:5173)

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Usage

### Starting a Tracking Session

1. Click "Start Tracking" in the header
2. You'll receive notifications at your configured interval
3. When notified, fill in what you did and optionally add tags
4. Continue until you're done, then click "Stop Tracking"

### Quiet Mode

- Click "Quiet Mode" to temporarily disable notifications
- Or configure Quiet Time schedules in Settings for automatic do-not-disturb periods

### Viewing Reports

- **Dashboard**: See today's statistics and recent activities
- **Reports**: Analyze time by tags, view timeline, export CSV
- **History**: Search and filter all activities

### Settings

Click the ⚙️ icon to configure:
- Notification interval (minutes and seconds)
- Quiet time schedules
- Notification sounds
- Browser notification permissions

## Technologies

- **React 18**: Modern UI library
- **TypeScript**: Type safety and better developer experience
- **Zustand**: Lightweight state management
- **Vite**: Fast build tool and dev server
- **date-fns**: Date manipulation utilities
- **Web APIs**: Notifications API, Web Audio API, localStorage

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (requires notification permission)
- Mobile browsers: Partial support (notifications may be limited)

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Follow the existing code structure and patterns
2. Use TypeScript for type safety
3. Write clean, documented code
4. Test your changes thoroughly

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Future Enhancements

- Cloud sync across devices
- More chart visualizations
- Pomodoro timer integration
- Goal setting and tracking
- Team collaboration features
- Mobile app (React Native)
- Dark mode theme
- Calendar integration
- Advanced analytics with AI insights

## Support

For issues or questions, please open an issue on GitHub.
