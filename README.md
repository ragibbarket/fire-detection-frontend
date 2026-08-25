# Fire Guard Dashboard (React)

Control-room style web dashboard for the fire detection backend. Shows live
sensor readings, alert history, and lets you notify a fire station once an
alert has been human-verified.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev             # starts on http://localhost:5173
```

Make sure the Node.js backend (`fire-detection-backend`) is running first -
this dashboard is a pure client that talks to it over REST + Socket.io.

## Pages

- **`/`** - Dashboard: live sensor readings (updates via Socket.io
  `sensor:reading`), current safe/alert status, and the 5 most recent alerts.
- **`/alerts`** - Full alert history with status filter tabs (pending
  verification, verified fire, false alarm, notified).
- **`/alerts/:id`** - Alert detail: sensor readings, ML prediction and
  confidence. If the alert is `verified_fire`, shows the nearest fire
  stations with a one-click "Notify" button that calls
  `POST /api/fire-stations/:id/notify`.

## API calls used (`src/api/client.js`)

- `GET /api/sensor-data/latest`
- `GET /api/alerts`
- `GET /api/alerts/:id`
- `GET /api/fire-stations?lat=..&lng=..`
- `POST /api/fire-stations/:id/notify`

## Real-time events (`src/api/socket.js`)

- `sensor:reading` - new sensor data, updates the dashboard live
- `alert:new` - new alert created
- `alert:verified` - a verifier confirmed/rejected via the emailed link
- `alert:notified` - a fire station was successfully notified

## Notes

- The verify-alert screen (opened from the emailed link) and the
  "Confirm / False alarm" action are meant to live in the mobile app
  (Flutter), not this dashboard - this dashboard is for monitoring +
  picking a fire station once verification has already happened.
- Styling is plain CSS with design tokens in `src/index.css` (no Tailwind/UI
  kit dependency), so it stays lightweight for a student project.
