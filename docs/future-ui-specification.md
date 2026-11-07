# GEORYNTH — Future UI & Experience Specification
**Vision:** Google Maps-Grade Geographical Usability Reimagined for Social Meetups  
**Design Approach:** Adaptive, Minimal, Welcoming, Highly Responsive, Student-Friendly  
**Theme:** Light default (`#F7F9F8`), System-aware, Dark mode (`#0D1318`)

---

## 1. Design Token Architecture

### Color Palette

| Token | Light Theme | Dark Theme | Purpose |
|---|---|---|---|
| `--color-background` | `#F7F9F8` | `#0D1318` | Base application background |
| `--color-surface` | `#FFFFFF` | `#141D24` | Primary cards, panels, modals |
| `--color-surface-secondary` | `#F0F4F2` | `#1C2730` | Hover states, tab backgrounds |
| `--color-surface-elevated` | `#FFFFFF` | `#23303B` | Floating controls, tooltips |
| `--color-text-primary` | `#17211F` | `#F2F6F7` | Headings, titles, high contrast |
| `--color-text-secondary` | `#62716C` | `#A5B4BC` | Subtitles, body descriptions |
| `--color-text-muted` | `#95A5A0` | `#6C7F89` | Placeholders, timestamps, borders |
| `--color-primary` | `#168B6D` | `#65D7AE` | Primary buttons, active tabs, brand |
| `--color-primary-hover` | `#126E56` | `#4FC49B` | Button hover states |
| `--color-primary-soft` | `#E3F5EE` | `#18392F` | Pill highlights, icon backdrops |
| `--color-nav-blue` | `#628CCB` | `#7DA8E8` | Directions, route polylines |
| `--color-border` | `#E3EAE6` | `#2A3840` | Subtle division lines |
| `--color-border-subtle` | `#EDF2EF` | `#202D36` | Card separators |
| `--color-fairness-gold` | `#F59E0B` | `#FBBF24` | Winner / Fairest venue badges |

---

## 2. Desktop Application Shell Architecture

### Layout Grid

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [G] GEORYNTH    [Plan] [My Meetups] [Explore] [Saved]     [+ Plan] [⚙] │
├──────────────────────┬─────────────────────────────────────────────────┤
│                      │                                                 │
│ DOCK PANEL           │ FULL MAPLIBRE CANVAS                            │
│ (380px or collapsed) │                                                 │
│                      │  • Vector tiles (Streets / Satellite / Night)   │
│ • Search bar         │  • Dynamic camera padding: [380, 40, 40, 40]    │
│ • Category chips     │  • Participant avatar markers                   │
│ • Mode switcher      │  • Venue ranking markers (#1, #2, #3)           │
│ • Venue cards        │  • Multi-route converging polylines             │
│ • Travel breakdowns  │                                                 │
│ • Voting & confirm   │  [Controls: Zoom, Recenter, Style, Layers]      │
│                      │                                                 │
└──────────────────────┴─────────────────────────────────────────────────┘
```

### Key Principles
1. **Never Obscure the Map**: The left dock panel sits inside the document flow (or flex layout), pushing the map canvas rather than floating over it. On smaller screens, the dock can collapse with a single click on the collapse button.
2. **Camera Padding**: `map.easeTo({ center: coords, padding: { left: isDockOpen ? 400 : 40, right: 40, top: 80, bottom: 40 } })`.
3. **Decoupled Map Style & UI Theme**: Users can browse the light UI with a satellite map, or dark UI with a clean streets map.
4. **No Dev Telemetry**: Coordinate numbers, pitch angles, and raw bearings are removed from view.

---

## 3. Responsive Breakpoints & Mobile Bottom Drawer

| Viewport | Layout Strategy |
|---|---|
| **Desktop (≥1024px)** | Integrated 2-column shell: 380px left rail + full maplibre canvas. |
| **Tablet (768px – 1023px)** | 340px collapsible drawer with overlay backdrop when opened. |
| **Mobile (<768px)** | Full-screen interactive map + Floating search + Gesture bottom sheet (3 snap points: 15% peek, 50% list, 90% full detail) + Bottom tab bar. |

---

## 4. Student & Social Delight Features

1. **Vibe Chips**: Large interactive chips: ☕ Study & Coffee, 🍕 Budget Pizza, 🍛 Chai & Samosa, 🎬 Movie Night, 🎮 Arcade / Gaming.
2. **1-Tap WhatsApp Share**: Automatically generates a formatted text snippet with the meetup title, time, and join link:
   > *"Hey squad! Planning a hangout for Friday 7 PM: 'Chai & Code'. Vote on the fairest spot here: https://georynth.app/meetup/hyderabad-hangout"*
3. **Fairness Meter**: Visual horizontal bar showing how evenly travel time is split across the group.
4. **Interactive Turn-by-Turn Inspector**: Clicking any friend's name highlights only their route from their origin to the venue.
