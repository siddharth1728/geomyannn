# GEORYNTH — Current State Audit & System Evaluation
**Date:** November 7, 2026  
**Auditor:** Principal Software & Geospatial Systems Architect  
**Product:** GEORYNTH ("Find a place everyone can reach. Less planning. More meeting.")  
**Scope:** Web Application (Next.js 15), Multi-Platform Architecture, External Services, Security, and Code Quality.

---

## 1. Executive Summary

GEORYNTH has successfully completed its core geospatial engine and Phase 2 group meetup system transformation on the web platform. The system operates with verified live external integrations (MapTiler Streets v2, GraphHopper Directions & Matrix APIs, Supabase cloud database with migration schema), passing all automated unit and integration tests.

The consumer user experience has been restructured around three hero actions (**Plan a Meetup**, **Join a Meetup**, **Explore Nearby**) and a clean five-tab primary navigation (**Plan**, **My Meetups**, **Explore**, **Saved Places**, **Settings**).

This audit evaluates the codebase to establish the baseline for the **Multi-Platform Evolution** (adding the native Expo React Native iOS/Android app in `apps/mobile/`, shared domain packages, and universal deep linking).

---

## 2. Feature & Capability Matrix

| Capability | Status | Implementation Details & Verification |
| :--- | :--- | :--- |
| **Interactive Map Canvas** | **Fully Implemented** | MapLibre GL JS v5 with MapTiler `streets-v2` (Google Maps-like POIs, road hierarchy, landmarks), `satellite-hybrid`, and `streets-v2-dark`. Smooth fly-to, pitch, bearing, and zoom controls. Fallback to OpenFreeMap Liberty style if network fails. |
| **Global Geocoding & Search** | **Fully Implemented** | Server-side `GET /api/geocode` proxying MapTiler Geocoding API with 300ms debouncing, client abort controllers, coordinate parsing, and Hyderabad quick-jump chips. |
| **GraphHopper Road Routing** | **Fully Implemented** | `POST /api/route` proxy with real GraphHopper key. Calculates real turn-by-turn road routes across Hyderabad (tested Kukatpally to Dilsukhnagar: 17.8 km, 45 min, 190 coordinate waypoints, HTTP 200 OK). |
| **Multi-Origin Matrix Engine** | **Fully Implemented** | `POST /api/meetups/[id]/matrix` with live GraphHopper Matrix API support (`POST https://graphhopper.com/api/1/matrix`). Generates N-to-M distance & travel time matrices. |
| **Fairness Ranking Modes** | **Fully Implemented** | 3 consumer-transparent ranking modes: `fairest` (minimax travel disparity), `fastest` (minimum total group travel time), and `best_match` (balanced score + category match). No arbitrary percentage scores; transparent individual travel times. |
| **Real Place / Venue Provider** | **Fully Implemented** | Modular provider in `src/lib/providers/venues.ts`. Supports Foursquare Places API (with API key) and OSM Overpass/Nominatim geo-radius queries with curated Hyderabad flagship POIs fallback. |
| **Group Meetup Lifecycle** | **Fully Implemented** | Create meetup, generate private 6-character invite code, join with code/link, manage participant locations, vote on venues, confirm venue, generate multi-participant converging routes. |
| **Consumer UX Architecture** | **Fully Implemented** | `HeroWelcomeCard`, `PlanMeetupModal`, `JoinMeetupModal`, `MeetupWorkspace`, `MyMeetupsList`, `DiscoverPlacesPanel`. Mobile-responsive slide-out / bottom sheet design. |
| **Database Migrations** | **Fully Implemented** | PostgreSQL DDL in `supabase/migrations/20261107000000_initial_schema.sql` and `20261107000001_meetup_system.sql`. Strict Row Level Security (RLS) policies on meetups, members, locations, and votes. |
| **Mobile App (iOS & Android)** | **In Progress** | Dedicated Expo React Native mobile workspace (`apps/mobile/`) with native MapLibre (`@maplibre/maplibre-react-native`), Expo Router, Expo Location, and gesture bottom sheets. |
| **Deep & Universal Linking** | **In Progress** | URL scheme `georynth://meetup/:inviteCode` and web universal link `https://georynth.app/meetup/:inviteCode`. |

---

## 3. External Integrations & Configuration Status

| Provider | Purpose | Status | Rate Limit & Quotas | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **MapTiler Cloud** | Vector Map Tiles, Styles, Geocoding | **Active & Verified** | 100k requests/month (Free Tier) | Key `gDCzA1avLA0udEVVgHhl`. Works with `streets-v2`, `hybrid`, `streets-v2-dark`. |
| **GraphHopper** | Directions & Distance Matrix | **Active & Verified** | 500 req/day (Free Tier), 30 req/min burst limit | Key `6ebdeb32-4581-4b86-97f7-c187909e4a07`. Matrix API verified with 4 origins x 4 venues. Paced route requests prevent 429 burst errors. |
| **Supabase Cloud** | Postgres DB, Auth, Realtime | **Connected** | Free Tier | URL `https://ppytdnhvvbmhaaurydza.supabase.co`, publishable key `sb_publishable_1PBI0qGXF2hKfxqmkQhJkg_l0B5YuLU`. |
| **Foursquare Places** | Commercial Venue POI Discovery | **Adapter Ready** | Standard API Tier | Plug-in adapter ready in `venues.ts`; defaults cleanly to OSM Overpass/Nominatim geo queries when key is omitted. |

---

## 4. Security & Privacy Audit

1. **Credential Exposure:**
   - Client bundles only expose `NEXT_PUBLIC_MAPTILER_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, which are strictly intended for public client-side map rendering and Supabase public auth.
   - GraphHopper API key (`GRAPHHOPPER_API_KEY`) is stored strictly in server-side environment variables and proxied through `/api/route` and `/api/meetups/[id]/matrix`.
   - Never logged or exposed in client responses.

2. **Location Privacy:**
   - No background geolocation tracking.
   - Foreground coordinates are acquired only upon explicit user tap.
   - Users can choose approximate coordinates or manually pick starting points on the map.
   - Session coordinates are temporary and revocable by the participant.

3. **Database Authorization (RLS):**
   - Tables (`meetups`, `meetup_members`, `meetup_locations`, `meetup_venues`, `meetup_votes`) are protected by Row Level Security.
   - Non-members cannot query location data or invite codes.

4. **Input Validation:**
   - All API endpoints validate request payloads with Zod schemas (`src/lib/validation/schemas.ts`).

---

## 5. Architectural Recommendations for Multi-Platform

1. **Shared Domain Layer (`packages/domain`):**
   - Extract core TypeScript interfaces (`Meetup`, `CandidateVenue`, `RankingMode`, `ParticipantLocation`) and ranking algorithms (`rankVenues`, `calculateFairnessMetrics`) so that Web and Mobile share identical calculation logic without duplication.
2. **Mobile Application Shell (`apps/mobile`):**
   - Build a standalone Expo SDK 52 application in `apps/mobile/` using `@maplibre/maplibre-react-native` for high-performance 60fps native vector rendering.
   - Implement bottom-sheet drawers using `react-native-reanimated` and `react-native-gesture-handler`.
   - Support `expo-location` for one-tap voluntary origin sharing.
3. **Deep Linking Handler:**
   - Configure Expo linking with custom scheme `georynth://` to seamlessly open meetups from invitation messages.
