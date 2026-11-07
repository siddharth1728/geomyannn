# GEORYNTH Architecture & System Design
**Product:** GEORYNTH ("Find a place everyone can reach. Less planning. More meeting.")  
**Target Release:** November 7, 2026  
**Platforms:** Web (Next.js 15), iOS & Android (Expo SDK 52 React Native)

---

## 1. High-Level Architecture

GEORYNTH uses a modern multi-platform monorepo architecture:

```
                            +-------------------------------------------+
                            |            SHARED DOMAIN LAYER            |
                            |            (@georynth/domain)             |
                            |  - Types: Meetup, Venue, Geo, Profiles    |
                            |  - Fairness Metrics & Ranking Algorithms  |
                            |  - Formatters & Coordinate Math           |
                            +--------------------+----------------------+
                                                 |
                   +-----------------------------+-----------------------------+
                   |                                                           |
                   v                                                           v
+-------------------------------------+                     +-------------------------------------+
|        WEB APPLICATION              |                     |      MOBILE APPLICATION             |
|          (src/app)                  |                     |        (apps/mobile)                |
|  - Next.js 15 App Router            |                     |  - Expo SDK 52 / React Native       |
|  - React 19 + Tailwind CSS          |                     |  - Expo Router v4                   |
|  - MapLibre GL JS v5                |                     |  - @maplibre/maplibre-react-native  |
|  - 3 Hero Actions + 5 Main Tabs     |                     |  - Native Gesture Bottom Sheet      |
|  - Web Geolocation API              |                     |  - Expo Location (Foreground)       |
+------------------+------------------+                     +------------------+------------------+
                   |                                                           |
                   +-----------------------------+-----------------------------+
                                                 |
                                                 v
                            +-------------------------------------------+
                            |          BACKEND & API LAYER              |
                            |            (Next.js Route Handlers)       |
                            |  - POST /api/meetups                      |
                            |  - POST /api/meetups/[id]/locations       |
                            |  - POST /api/meetups/[id]/matrix          |
                            |  - POST /api/meetups/[id]/votes           |
                            |  - POST /api/meetups/[id]/confirm         |
                            |  - GET  /api/geocode                      |
                            +--------------------+----------------------+
                                                 |
              +----------------------------------+----------------------------------+
              |                                  |                                  |
              v                                  v                                  v
+----------------------------+     +----------------------------+     +----------------------------+
|     MAPTILER CLOUD         |     |     GRAPHHOPPER ENGINE     |     |     SUPABASE CLOUD         |
|  - Streets v2 (Google-like)|     |  - Directions API          |     |  - PostgreSQL Database     |
|  - Satellite Hybrid        |     |  - Matrix API (N x M)      |     |  - Row Level Security      |
|  - Streets v2 Dark         |     |  - Car, Bike, Foot         |     |  - Realtime Engine         |
+----------------------------+     +----------------------------+     +----------------------------+
```

---

## 2. Directory Structure

```
GEOMYANNN/
├── apps/
│   └── mobile/                        # Expo SDK 52 React Native Application
│       ├── app/
│       │   ├── _layout.tsx            # Root Stack & Deep Linking
│       │   ├── (tabs)/                # 5-Tab Navigation
│       │   │   ├── _layout.tsx        # Tab bar configuration
│       │   │   ├── index.tsx          # Plan / Hero Action screen
│       │   │   ├── my-meetups.tsx     # Meetups list
│       │   │   ├── explore.tsx        # Vector map POI discovery
│       │   │   ├── saved.tsx          # Bookmarked coordinates
│       │   │   └── settings.tsx       # User & privacy settings
│       │   ├── meetup/[id].tsx        # Meetup Cockpit with Native MapLibre
│       │   ├── plan-modal.tsx         # Interactive Plan Meetup modal
│       │   └── join-modal.tsx         # Interactive Join modal
│       ├── components/
│       │   ├── NativeMap.tsx          # @maplibre/maplibre-react-native Canvas
│       │   ├── VenueCard.tsx          # Venue card with individual travel times
│       │   └── RankingModeSelector.tsx# 3-mode selector (Fairest, Quickest, Best Match)
│       ├── lib/                       # Mobile API, Supabase, and Location utilities
│       ├── app.json                   # Expo configuration, plugins, deep link schemes
│       └── eas.json                   # EAS Build profiles for iOS & Android
├── packages/
│   └── domain/                        # Shared cross-platform business logic & types
│       ├── src/
│       │   ├── types/meetup.ts        # Meetup, Venue, Vote, Preferences interfaces
│       │   ├── types/geo.ts           # Coordinates, Route, Waypoint interfaces
│       │   ├── fairness.ts            # Fairness disparity calculations & ranking
│       │   └── formatters.ts          # Duration, distance, budget formatting
├── src/                               # Next.js 15 Web Application
│   ├── app/
│   │   ├── api/meetups/               # Meetup CRUD, locations, matrix, votes, confirm
│   │   ├── api/geocode/               # MapTiler geocoding proxy
│   │   ├── api/route/                 # GraphHopper route proxy
│   │   └── page.tsx                   # Main Web Meetup HUD & Map Canvas
│   ├── components/
│   │   ├── meetup/                    # Consumer UX components
│   │   └── map/                       # MapLibre GL JS v5 integration
│   ├── lib/
│   │   ├── meetups/store.ts           # Store with Hyderabad 4-origin seed data
│   │   └── providers/                 # GraphHopper Matrix, MapTiler, Venues
│   └── types/                         # Local web types
├── supabase/
│   └── migrations/                    # PostgreSQL DDL migrations with RLS policies
└── docs/                              # Project documentation & audits
```

---

## 3. Fairness Calculation & Ranking Engine

Rather than presenting users with arbitrary or opaque percentage scores, GEORYNTH provides **mathematically grounded, transparent travel time metrics**:

1. **Disparity Index ($\Delta t$):**
   $$\Delta t = \max(t_i) - \min(t_i)$$
   Where $t_i$ represents the GraphHopper road-network travel duration from participant $i$'s starting origin to candidate venue $V$.
2. **Average Travel Duration ($\bar{t}$):**
   $$\bar{t} = \frac{1}{N} \sum_{i=1}^{N} t_i$$
3. **Transparent Explanations:**
   - $\Delta t \le 10 \text{ min}$: *"Exceptional fairness: only a X-minute gap between closest and farthest friend."*
   - $10 < \Delta t \le 18 \text{ min}$: *"Balanced central location with an average drive time of Y minutes."*
   - $\Delta t > 18 \text{ min}$: *"Convenient for [Nearest], but involves up to a Z-minute trip for [Farthest]."*

### Ranking Modes
- **Fairest for Everyone:** Minimizes $\Delta t$, breaking ties with $\max(t_i)$.
- **Quickest Overall:** Minimizes $\bar{t}$ (total group travel duration).
- **Best Group Match:** Balances customer rating $R_v$ against average duration.

---

## 4. Multi-Platform Deep Linking

GEORYNTH supports universal and custom-scheme deep links:
- **Mobile Custom Scheme:** `georynth://meetup/:inviteCode`
- **Universal Link:** `https://georynth.app/meetup/:inviteCode`
- Tapping a shared invite automatically opens the Meetup Cockpit or Join Modal with prefilled parameters.
