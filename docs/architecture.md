# GEORYNTH — Architecture Specification

## 1. Executive Summary

GEORYNTH is an enterprise-grade geospatial mission-control web platform built using Next.js 15 App Router, TypeScript, Tailwind CSS, MapLibre GL JS, and Supabase. It transforms geospatial data into an active exploration, routing, and infrastructure reporting interface with Hyderabad, India as the default showcase center (`17.3850° N, 78.4867° E`), and global coverage.

---

## 2. Component Architecture

```
+-----------------------------------------------------------------------------------+
|                                  GEORYNTH HUD                                     |
|  +--------------------+  +-----------------------------------------------------+  |
|  |   MissionSidebar   |  |                  GlobalSearch                       |  |
|  | - Explore          |  | - Debounced Geocoding                               |  |
|  | - Directions       |  | - Place Cards & Navigation                          |  |
|  | - Road Network     |  +-----------------------------------------------------+  |
|  | - Community        |  |                 Contextual Panels                   |  |
|  | - Saved Places     |  | - DirectionsPanel (GraphHopper)                     |  |
|  | - Account          |  | - ReportIssueModal & Details                        |  |
|  |                    |  | - SavedPlacesPanel                                  |  |
|  |                    |  | - NetworkLegend                                     |  |
|  +--------------------+  +-----------------------------------------------------+  |
|  |                                                                                |
|  |                        MapContainer (MapLibre GL JS)                           |
|  |  - Base Vector Tile Layer (MapTiler dark theme / OpenStreetMap)                |
|  |  - Road-Network Intelligence (data-driven vector styling)                      |
|  |  - Route Geometry Overlay (GeoJSON LineString)                                 |
|  |  - Interactive Community Report Markers (GeoJSON FeatureCollection)            |
|  |  - Live Geolocation Pulse Marker                                               |
|  |  - Viewport Controls (Compass, Pitch, Zoom, Reset, Fullscreen)                 |
|  +--------------------------------------------------------------------------------+
|  |               StatusBar (Telemetry, Coordinates, Provider Status)              |
+--+--------------------------------------------------------------------------------+
```

---

## 3. Data Flow & Security Model

1. **Client-Side:**
   - Map rendering is isolated to browser-only components (`useMapInstance`).
   - No secret keys are leaked to client bundles.
   - User Geolocation is only accessed after direct user interaction via `navigator.geolocation`.
2. **Server-Side API Proxies:**
   - `GET /api/geocode`: Calls MapTiler Geocoding API with query sanitization and coordinate bounding.
   - `POST /api/route`: Calls GraphHopper Directions API with profile mapping (`car`, `bike`, `foot`) and returns normalized GeoJSON lines with distances and durations.
   - `GET / POST /api/reports`: Queries/inserts community reports in Supabase using session verification.
3. **Database Security:**
   - RLS enabled across all user tables.
   - Authenticated user IDs verified via Supabase SSR token cookies.

---

## 4. Error Handling & Provider Resilience

- If MapTiler key is missing: The map automatically falls back to an open dark vector tile style, alerting the user via the telemetry status bar without halting the application.
- If GraphHopper key is missing: The routing panel presents a clear provider configuration prompt specifying `GRAPHHOPPER_API_KEY`, rather than silently failing or inventing fake routes.
- If Supabase is unconfigured: Community reporting and saved places display a clear "Database credentials required" notice while keeping all map exploration tools 100% operational.
