# Home Dashboard — Complete Redesign Design

**Date:** 2026-03-24
**Status:** Approved

---

## Overview

A warm minimal personal homelab command center — single-page, at-a-glance, with depth available on demand. Styled for calm daily use, usable by non-technical household members, and visually impressive as a showpiece.

---

## Tech Stack (unchanged)

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Mantine (settings only), Recharts, Lucide React
- **Backend:** Express 5, SQLite, WebSocket (ws), systeminformation, axios
- **No changes to tech stack** — only the UI is redesigned

---

## Layout Structure

Single scrollable canvas with three horizontal zones:

### Top Bar (56px, persistent)
- **Left:** Greeting text ("Good morning, [Name]") — small, refined
- **Right:** Weather widget (icon + °C + city), current time (HH:MM), settings gear
- Full-width blurred glass background, no logo or heavy branding

### Hero Zone (above the fold)
Two panels side by side filling the viewport:

**Service Launchpad (~65% width)**
- Organized into collapsible category sections (Media, System, Security, Dev & Network — user-editable)
- Compact service cards with icon, name, status dot
- Favorites pinnable to top of category
- Edit mode for reordering, removing, and adding services/categories

**Quick Status Stack (~35% width)**
- System Health card — CPU%, RAM%, Disk%, Uptime in 2x2 grid, color-coded status bars
- Minecraft Server control — power button + status badge + last log line

### Fluid Zone (below the fold)
Panels collapsed by default:

**Docker Containers Panel**
- Header shows container count and aggregate health (X running / Y stopped)
- Expanded: grouped by compose project, each container with name/image/status/actions
- Start/Stop/Restart controls per container

**Live Logs Panel**
- Collapsed: slim ticker showing last 3 log entries
- Expanded: scrollable log list (max 400px), color-coded by level, fade-in new entries, clear button

---

## Visual Design

### Color Palette — Warm Minimal Dark

| Role | Value |
|------|-------|
| Background | `#0F0F12` |
| Surface (cards) | `#18181C` |
| Surface Elevated | `#222228` |
| Border | `#2E2E38` |
| Text Primary | `#F0EDE6` |
| Text Secondary | `#8A8894` |
| Accent | `#E8A87C` (terracotta/coral) |
| Status Green | `#7EC8A0` (sage) |
| Status Amber | `#E8C87C` |
| Status Red | `#E88A7C` |
| Graph Blue | `#7CA8E8` (periwinkle) |
| Graph Purple | `#A87CA8` (lavender) |

### Light Theme Variant
- Background: warm cream palette (values TBD)
- All colors desaturated/warmed accordingly

### Typography
- **Headings / Title:** DM Sans, weights 500–700
- **Body / Labels:** DM Sans, weight 400–500
- **Monospace / Logs / Data:** JetBrains Mono
- Scale: 11px (muted) → 13px (body) → 15px (card titles) → 24px (section) → 32px (hero)

### Spatial System
- Base unit: 4px
- Card padding: 20px, gap: 16px, section gap: 32px
- Border radius: 16px (cards), 12px (buttons), 8px (inputs)
- Elevation: `box-shadow: 0 2px 16px rgba(0,0,0,0.3)` — no hard shadows

### Animations (Calm Pulsing)
- Status dots: gentle opacity pulse 0.6→1.0, 2s ease-in-out, infinite (online only)
- Number updates: soft fade transition 200ms
- Panel expand/collapse: smooth height 300ms ease
- Card hover: `translateY(-2px)` + shadow deepen, 200ms
- New log entries: fade in at top
- No jarring or continuous motion

### Cards & Panels
- Warm-tinted glass: `background: rgba(24,24,28,0.8)`, `backdrop-filter: blur(12px)`, subtle warm border
- No heavy gradients on card backgrounds
- Panel headers: icon + title + collapse chevron only — minimal

---

## Components

### Service Card
- ~80×80px or inline row depending on space
- Service icon (CDN/homarr-labs or emoji fallback), name below, status dot (top-right)
- Hover: subtle lift + terracotta border glow
- Click: opens service URL in new tab
- Edit mode: X to remove, color picker for dot

### System Health Card
- 2×2 grid: CPU%, RAM%, Disk%, Uptime
- Large numbers (32px) + small labels + colored status bar beneath each
- "View Details" click expands full monitoring: CPU/RAM area charts, disk breakdown, network stats
- Slides down smoothly on expand

### Minecraft Server Control Card
- Status badge: "Online" (sage green) / "Offline" (muted red) pill
- 64px circular power button — terracotta when off, sage green when on
- Running button pulses gently (opacity 0.7→1.0)
- Last log line in tiny monospace below
- "Console" link opens slide-out WebSocket log panel

### Docker Container Row
- Name, image (truncated), status dot, Start/Stop/Restart icon buttons
- Grouped by compose project or "Standalone"
- State changes animate smoothly

### Log Entry
- Timestamp (muted, monospace) + level pill (INFO/WARN/ERROR/DEBUG) + message
- Colors: INFO=text-secondary, WARN=amber, ERROR=muted-red, DEBUG=lavender

---

## Interactions & Behaviors

### Real-time Intervals
| Data | Interval |
|------|----------|
| System stats (CPU/RAM) | 5s |
| Container status | 15s |
| Service health | 30s |
| Logs | real-time (WebSocket) |
| Weather | 10min |

### Edit Mode
- Single "Edit" button in header toggles globally
- Services/categories become draggable to reorder
- Each card shows X to remove + color picker
- Category headers show rename input + drag handle
- "+ Add Category" and "+ Add Service" buttons appear
- Escape key exits edit mode
- All changes save to SQLite via existing API

### Service Health
- HTTP HEAD requests via axios to configured URLs
- Per-service status dots — only the affected card turns red
- Category header shows aggregate count (e.g., "3/4 online")

### Settings Modal
- Dashboard title, greeting name, weather city, theme toggle (Dark/Light), network node IP
- Uses existing Mantine form components, persisted to SQLite

### Drag & Resize
- No react-grid-layout this time — fixed panel positions
- Edit mode handles reordering within categories only
- Simpler DOM, calmer UX

---

## Data Model (unchanged)

Existing SQLite schema preserved:
- `services` — id, name, url, description, icon, iconUrl, color, category, `isPinned`
- `settings` — key/value pairs
- `stats_history` — timestamp, cpu, ram

New field `category` on services to support grouping. New field `isPinned` for favorites.

---

## Backend Changes

Minimal backend changes needed:
1. Add `category` and `isPinned` fields to service create/update API
2. Support new Docker container grouping by compose project (already returned by `docker ps`)
3. Optionally add disk breakdown to stats endpoint (systeminformation supports this)

---

## Implementation Order

1. **Theme & globals** — CSS variables, Tailwind config, Google Fonts, base styles
2. **Layout scaffolding** — Top bar, hero zone (Service Launchpad + Quick Stack), Fluid Zone
3. **Service Launchpad** — Category accordions, service cards, status dots, health polling
4. **System Health card** — 2×2 metrics grid, expand for charts
5. **Minecraft control card** — Power button, status badge, console link
6. **Docker Containers panel** — Grouped list, Start/Stop/Restart
7. **Live Logs panel** — Ticker, expand, color-coded entries
8. **Weather widget** (top bar) — Icon, temp, city, detail on click
9. **Edit mode** — Reorder, add/remove, categories
10. **Settings modal** — Existing Mantine form with new theme toggle
11. **Light theme** — Warm cream variant of palette
12. **Animations** — Calm pulsing dots, smooth transitions, fade-ins

---

## File Changes Summary

| Action | Files |
|--------|-------|
| Rewrite | `src/App.tsx`, `src/index.css`, `src/components/*.tsx` |
| Update | `server.cjs` (new service fields, disk breakdown), `tailwind.config.js` |
| Write | `docs/plans/2026-03-24-dashboard-redesign.md` |
| No change | `src/hooks/*.ts`, `src/api/*.ts` (mostly reuse) |
