# Home Dashboard

A modern React dashboard for controlling your home server and Minecraft server.

## Features

- Real-time Minecraft server control (start/stop)
- Live system logs
- Quick access to services (CasaOS, Immich, Nextcloud)
- Dark cyberpunk aesthetic
- Responsive design

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

## Build for Production

```bash
npm run build
```

The built files should be copied to `/opt/dashboard` on your server.

## Server Requirements

The dashboard expects these API endpoints:
- `GET /api/status` - Returns `{ running: boolean }`
- `POST /api/toggle` - Toggles server, returns `{ success, running }`
- `GET /api/logs` - Returns `{ logs: LogEntry[] }`
- `POST /api/logs/clear` - Clears logs

## Project Structure

```
src/
├── api/           # API calls
├── components/    # React components
├── hooks/         # Custom React hooks
├── types/         # TypeScript types
├── App.tsx        # Main component
└── App.css        # Styles
```
