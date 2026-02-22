# VeinCheck Command Demo

VeinCheck Command is a desktop-first clinical operations dashboard demo for unit-wide IV site monitoring and response coordination.

This repository is a front-end-only prototype built for investor/internal screenshots and workflow demos using synthetic data (no backend, no database, no authentication).

## Demo Data Disclaimer

This app uses fully synthetic, de-identified demo data and device IDs.
It is **not for clinical use** and should not be used for patient care decisions.

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Recharts
- Lucide icons
- Zustand (demo/UI state)
- date-fns
- shadcn-style UI components (buttons/cards/badges/tabs/switches/toast patterns)

## Features

- Desktop-first Unit Board with 3-column layout (alert queue, unit map, right rail)
- ICU North seeded demo data matching product/demo notes (alerts, bed states, metrics, Bed 12 detail/trends)
- Role simulation with role-gated modules/actions/metrics
- Privacy toggle flow with identifier reveal restrictions
- Global search with categorized dropdown results (beds, alerts, devices, review cases)
- Patient detail panel with synced trend charts, timeline, and action checklist
- Devices module with fleet filters, pod table, and detailed pod traceability panel
- Analytics module with KPI cards, operations charts, and Case Review labeling workflow
- Integrations & Privacy module with toggleable demo config + audit log viewer
- Demo Controls page (fixed/live clock, screenshot mode, network status, queue simulation toggles)
- Deterministic demo clock and screenshot query params

## Role Simulation Matrix

- `Staff Nurse`: Unit Board, Integrations/Privacy, Demo Controls
- `Charge Nurse`: Unit Board, Integrations/Privacy, Demo Controls
- `Leadership`: Unit Board, Analytics, Integrations/Privacy, Demo Controls, `Create report`
- `QA Reviewer`: Unit Board, Analytics, Integrations/Privacy, Demo Controls, `Create report`
- `Biomed Tech`: Unit Board, Devices, Integrations/Privacy, Demo Controls
- `Unit Manager`: Unit Board, Devices, Analytics, Integrations/Privacy, Demo Controls
- `Admin`: All modules, `Create report`, identifier reveal support

Role-gated UI rules implemented:
- `Create report` visible only to Leadership / QA Reviewer / Admin
- `False alert review queue` metric visible only to QA Reviewer / Leadership / Admin
- `Devices` tab visible only to Biomed Tech / Unit Manager / Admin
- `Analytics` tab visible only to Leadership / QA Reviewer / Unit Manager / Admin

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Build production assets:

```bash
npm run build
```

## Screenshot / Capture Suggestions

- Use a desktop viewport at `1440x900` or `1600x900` for primary screenshots.
- Default screenshot-ready state is ICU North with Bed 12 selected.
- For stable captures, use screenshot mode query params (below).
- Good screenshots to capture:
  1. Unit Board with Bed 12 detail open
  2. Devices page with `VC-POD-0417` selected
  3. Analytics Overview charts
  4. Analytics Case Review labeled/unlabeled cases
  5. Integrations & Privacy audit log panel

## Role Switch Instructions

- Use the role selector in the top header (blue bar).
- Switch roles to demo role-based visibility changes in real time.
- `Admin` is required to reveal patient identifiers when the privacy policy toggle `Require elevated role to reveal MRN` is enabled (default).

## Demo Clock / Screenshot Mode URLs

Query params supported:

- Fixed clock (default):
  - `http://localhost:5173/?demoClock=fixed`
- Live clock:
  - `http://localhost:5173/?demoClock=live`
- Screenshot mode (fixed, deterministic):
  - `http://localhost:5173/?demoClock=fixed&screenshot=1`

Notes:
- Fixed clock default seed time is **2026-02-22 08:12:34 (local)**.
- Screenshot mode suppresses pulsing/noisy motion for stable captures.

## Cloudflare Pages Deployment (Static Vite SPA)

### Option 1: Connect repository

1. In Cloudflare Pages, choose **Create a project**.
2. Connect this Git repository.
3. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy.

### Option 2: Direct upload

1. Run `npm run build` locally.
2. Upload the `dist` directory to Cloudflare Pages.

### SPA note

This is a static React/Vite single-page app. Cloudflare Pages can serve it as a static SPA deployment. If deep-link routing behavior needs refinement later, add a Pages `_redirects` / `_headers` strategy or equivalent SPA fallback config.

## Assumptions (Documented)

The docs/spec left some implementation details open. This demo makes the following reasonable assumptions:

- Auto-escalation applies to unacknowledged `high` and `moderate` alerts (not `sensor_issue`) after the configured threshold.
- Non-Admin roles can see the `Reveal identifiers` control, but the demo policy blocks reveal when elevated role is required.
- Trend chart trigger marker uses the nearest available chart timestamp to represent the alert trigger when the exact trigger minute is between plotted samples.
- Pinch zoom is deferred in v1; polished quick windows (`15m / 1h / Full session`) are implemented instead.
- Resolved alerts can either disappear or remain visible based on Demo Controls toggle (`Remove resolved alerts from queue`).

## Future Enhancements

1. Real APIs for unit alerts, devices, and analytics datasets
2. Authentication / SSO and permission-backed role enforcement
3. EHR / FHIR integrations and structured documentation pushes
4. Live websocket streaming for device telemetry and alerts
5. Exportable audit logs and case-review datasets
6. Per-hospital theming and configurable unit layouts
7. Code splitting for smaller production bundles
