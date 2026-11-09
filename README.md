# GEORYNTH
### "Find a place everyone can reach. Less planning. More meeting."

**Product Category:** Social coordination, intelligent local discovery, and group mobility.  
**Platform:** Modern Web Application (Next.js 15, React 19, responsive desktop/tablet/mobile browsers).  
**Visual Direction:** Sophisticated adaptive consumer experience with vector map canvas.  
**Themes:** Adaptive Light (default), Dark, and System-aware.

---

## 🌟 Overview

GEORYNTH solves the fundamental friction of social coordination: people want to meet their friends, family, or colleagues, but choosing a suitable location is frustrating. Different people start from different parts of a city, travel via different transport modes, and have varying budgets.

GEORYNTH calculates **real road-network travel times** across all participants using **GraphHopper Matrix & Directions APIs**, compares candidate venues, and presents **transparent fairness metrics** so groups can effortlessly agree on where to meet.

---

## 🚀 Live Demo Scenario: Hyderabad 4-Friend Hangout

The application includes an end-to-end verified scenario across Hyderabad, India:
- **Participants:**
  1. **Aarav** starting from **Kukatpally** [17.4947, 78.3996]
  2. **Diya** starting from **Secunderabad** [17.4399, 78.4983]
  3. **Rohan** starting from **Mehdipatnam** [17.3916, 78.4414]
  4. **Ananya** starting from **Dilsukhnagar** [17.3688, 78.5247]
- **Centroid & Venues Evaluated:**
  - **Roastery Coffee House** (Banjara Hills) — *Winner for fairness: avg 22 min drive, max disparity only 8 min.*
  - **Cafe Niloufer Lounge** (Banjara Hills) — *Irani chai & bakes: avg 20 min drive.*
  - **Paradise Biryani** (Secunderabad) — *Quick for Diya (6 min), but 33 min for Aarav.*
- **Outcome:** Group votes on venues, confirms the meetup, and receives **individual turn-by-turn converging road routes** rendered simultaneously on the map canvas.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Web Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Vector Map Engine** | MapLibre GL JS v5, MapTiler Cloud (`streets-v2`, `hybrid`, `streets-v2-dark`) |
| **Routing & Matrix** | GraphHopper Directions & Matrix APIs (Car, Bike, Foot) |
| **Database & Auth** | Supabase Cloud (PostgreSQL, Row Level Security, Realtime) |
| **Domain Logic** | Shared fairness algorithms, validation, ranking metrics |
| **Testing** | Vitest (Automated unit tests for matrix math, fairness ranking, and formatters) |

---

## 💻 Project Architecture

```
GEOMYANNN/
├── packages/
│   └── domain/              # Pure domain logic & tests (fairness ranking, matrix math)
├── src/
│   ├── app/                 # Next.js App Router & API routes
│   │   ├── api/             # Matrix, Meetups, Places, Routes endpoints
│   │   ├── globals.css      # Adaptive light/dark design tokens
│   │   ├── layout.tsx       # Theme provider & root layout
│   │   └── page.tsx         # Unified Meetup & Map experience
│   ├── components/          # Polished UI components
│   │   ├── auth/            # Profile & App Settings modal
│   │   ├── layout/          # AppHeader, MobileTabBar, ThemeToggle
│   │   ├── map/             # MapContainer (MapLibre), MapControls, StyleSwitcher
│   │   ├── meetup/          # HeroWelcomeCard, MeetupWorkspace, PlanMeetupModal, JoinMeetupModal
│   │   ├── saved/           # SavedPlacesPanel
│   │   └── search/          # GlobalSearch autocomplete
│   ├── hooks/               # useTheme hook (System, Light, Dark)
│   ├── lib/                 # MapTiler, GraphHopper, Supabase, Geocoding providers
│   └── types/               # Type definitions for Meetups, Geo, Routes
└── supabase/
    └── migrations/          # PostgreSQL migrations with RLS policies
```

---

## ⚡ Quick Start

### 1. Environment Configuration
Copy `.env.example` to `.env.local` and add your provider credentials:
```bash
cp .env.example .env.local
```

Required environment variables in `.env.local`:
```env
# MapTiler (Map tiles & Geocoding)
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key_here

# GraphHopper (Routing & Travel Time Matrix)
GRAPHHOPPER_API_KEY=your_graphhopper_key_here

# Supabase (PostgreSQL Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Run the Web Application
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Test Suite & Typecheck
```bash
npm test            # Runs Vitest unit tests
npm run typecheck   # Typecheck entire codebase
npm run build       # Production build verification
```

---

## 🔒 Privacy Principles

- **Voluntary Sharing:** Starting locations are only shared when explicitly authorized by the user.
- **No Background Tracking:** GEORYNTH never accesses device location in the background.
- **Approximate Pin Support:** Users can offset their pin by ~500m or select a general neighborhood instead of their exact home address.
- **Automatic Expiration:** Meetup location sessions expire automatically after 24 hours.

---

## 📄 License & Attribution

- **Maps:** © [MapTiler](https://www.maptiler.com/) © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- **Routing:** Powered by [GraphHopper](https://www.graphhopper.com/).
