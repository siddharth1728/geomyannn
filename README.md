# GEORYNTH
### "Find a place everyone can reach. Less planning. More meeting."

**Product Category:** Social coordination, intelligent local discovery, and group mobility.  
**Platforms:** Web (Next.js 15), iOS & Android (Expo SDK 52 / React Native).  
**Visual Direction:** Geospatial Mission Control with effortless consumer UX.

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
| **Web Client** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Mobile Client** | Expo SDK 52, React Native, Expo Router v4, `@maplibre/maplibre-react-native` |
| **Vector Map Engine** | MapLibre GL JS v5, MapTiler Cloud (`streets-v2`, `hybrid`, `streets-v2-dark`) |
| **Routing & Matrix** | GraphHopper Directions & Matrix APIs (Car, Bike, Foot) |
| **Database & Auth** | Supabase Cloud (PostgreSQL, Row Level Security, Realtime) |
| **Shared Domain** | `@georynth/domain` (Fairness algorithms, validation, shared types) |
| **Testing** | Vitest (Automated unit tests for matrix math, fairness ranking, and formatters) |

---

## 📱 Multi-Platform Architecture

```
GEOMYANNN/
├── apps/
│   └── mobile/              # Expo React Native App (iOS & Android)
│       ├── app/             # Expo Router screens (Tabs, Meetup Cockpit, Modals)
│       ├── components/      # NativeMap, VenueCard, RankingModeSelector
│       └── lib/             # Mobile API, Supabase, and Location utilities
├── packages/
│   └── domain/              # Shared business logic & types (@georynth/domain)
├── src/                     # Next.js Web App
│   ├── app/api/             # Server-side API Route Handlers
│   └── components/          # Web UI & MapLibre components
└── supabase/
    └── migrations/          # PostgreSQL migrations with RLS policies
```

---

## ⚡ Quick Start

### 1. Environment Configuration
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_MAPTILER_KEY=gDCzA1avLA0udEVVgHhl
GRAPHHOPPER_API_KEY=6ebdeb32-4581-4b86-97f7-c187909e4a07
NEXT_PUBLIC_SUPABASE_URL=https://ppytdnhvvbmhaaurydza.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_1PBI0qGXF2hKfxqmkQhJkg_l0B5YuLU
```

### 2. Run the Web Application
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run the Mobile Application (iOS & Android)
```bash
cd apps/mobile
npm install
npx expo start
```
- Press `a` for Android Emulator.
- Press `i` for iOS Simulator.
- Scan QR code with Expo Go on a physical device.

### 4. Run Test Suite & Typecheck
```bash
npm test            # Runs Vitest unit tests (11/11 passing)
npm run typecheck   # Typecheck entire codebase (0 errors)
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
