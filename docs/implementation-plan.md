# GEORYNTH — First Functional Release Implementation Plan
**Document Version:** 1.0.0  
**Target Release Date:** November 7, 2026  
**Status:** In Active Execution  

---

## 1. Workspace Inspection Results

- **Working Directory:** `C:\GEOMYANNN`
- **Initial State:** Empty directory (clean slate, no legacy code or conflicting configs).
- **Runtime Environment:** 
  - Node.js: `v24.21.0`
  - npm: `11.19.0`
  - OS: Windows (PowerShell)
- **Version Control:** Git repository initialized (`git init`).
- **Package Manager:** `npm` with clean Next.js 15 App Router, React 19, TypeScript 5, Tailwind CSS, MapLibre GL JS v5, Lucide React, and Supabase client libraries.

---

## 2. Architecture Decisions

1. **Frontend Architecture:**
   - **Framework:** Next.js 15 App Router with TypeScript.
   - **Styling:** Tailwind CSS with the **Geospatial Mission Control** design tokens (`#080D13` obsidian background, `#101821` dark navy surfaces, `#75E6C2` teal radar accents, `#71B9E8` cyan routing guides, `#E8B86B` amber warning telemetry).
   - **Map Engine:** MapLibre GL JS (`maplibre-gl`) dynamically mounted in a client component ref without duplicate canvas instantiations.
   - **Icons:** `lucide-react` with technical icon sizing and accessible SVG labeling.

2. **Backend & API Architecture:**
   - **Next.js Server API Routes (`src/app/api/...`):**
     - `GET /api/geocode`: MapTiler Geocoding API proxy with query debouncing, coordinate normalization, proximity bias towards current viewport/Hyderabad, and input validation via Zod.
     - `POST /api/route`: GraphHopper Routing API proxy with latitude/longitude coordinate pair validation, vehicle profile selection (`car`, `bike`, `foot`), distance calculation in km, duration parsing, and GeoJSON `LineString` coordinate formatting.
     - `GET /api/reports` & `POST /api/reports`: Community infrastructure reports endpoint with Supabase backend persistence, user authentication validation, and public active reports discovery.
     - `GET /api/saved-places` & `POST /api/saved-places`: User-authenticated place bookmarks.
   - **Secret Isolation:** External API keys (`MAPTILER_GEOCODING_KEY`, `GRAPHHOPPER_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept strictly server-side. The browser only accesses `NEXT_PUBLIC_MAPTILER_KEY` and public Supabase keys.

3. **Database & Persistence:**
   - **Platform:** Supabase PostgreSQL with Row Level Security (RLS).
   - **Tables:** `profiles`, `saved_places`, `community_reports`.
   - **Security:** RLS enforced on all tables. Authenticated users can only alter their own records; unverified reports cannot be marked verified by regular users.
   - **Offline / Standalone Fallback:** Graceful fallback state with clear configuration warnings and in-memory/demo cache when Supabase credentials or provider API keys are unpopulated.

---

## 3. Project Directory Structure

```text
c:\GEOMYANNN\
├── docs/
│   ├── implementation-plan.md
│   ├── architecture.md
│   ├── verification.md
│   └── known-limitations.md
├── public/
│   ├── icons/
│   └── assets/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── geocode/route.ts
│   │   │   ├── route/route.ts
│   │   │   └── reports/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MissionSidebar.tsx
│   │   │   └── StatusBar.tsx
│   │   ├── map/
│   │   │   ├── MapContainer.tsx
│   │   │   ├── MapControls.tsx
│   │   │   └── NetworkIntelligenceLayer.tsx
│   │   ├── search/
│   │   │   └── GlobalSearch.tsx
│   │   ├── routing/
│   │   │   └── DirectionsPanel.tsx
│   │   ├── reports/
│   │   │   ├── ReportIssueModal.tsx
│   │   │   └── ReportDetailsPanel.tsx
│   │   ├── saved/
│   │   │   └── SavedPlacesPanel.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       └── Card.tsx
│   ├── hooks/
│   │   ├── useGeolocation.ts
│   │   └── useMapInstance.ts
│   ├── lib/
│   │   ├── map/
│   │   │   ├── config.ts
│   │   │   └── styles.ts
│   │   ├── providers/
│   │   │   ├── maptiler.ts
│   │   │   └── graphhopper.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── validation/
│   │       └── schemas.ts
│   └── types/
│       ├── geo.ts
│       └── database.ts
├── supabase/
│   ├── migrations/
│   │   └── 20261107000000_initial_schema.sql
│   └── tests/
│       └── rls_verification.sql
├── .env.example
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
└── README.md
```

---

## 4. Feature Implementation Order

1. **Phase 0:** Workspace audit & architecture documentation.
2. **Phase 1:** Core dependencies, TypeScript configuration, Tailwind Mission Control design tokens, base shell layout.
3. **Phase 2:** MapLibre GL JS map integration with Hyderabad showcase default (`17.3850° N, 78.4867° E`), dark theme, zoom/pitch controls, geolocation, and Road-Network Intelligence vector layer toggle.
4. **Phase 3:** Global search proxy (`/api/geocode`) with debouncing, autocomplete suggestions dropdown, and fly-to animation.
5. **Phase 4:** GraphHopper routing (`/api/route`) supporting car, bicycle, and pedestrian profiles, GeoJSON LineString rendering on the map, duration and distance readout.
6. **Phase 5:** Supabase integration, migrations for `profiles`, `saved_places`, and `community_reports`, RLS policies, issue submission modal and map marker rendering.
7. **Phase 6:** Refined Mission Control HUD (collapsible panels, keyboard shortcuts, status bar, responsive mobile layout, rate-limit and missing-credential alerts).
8. **Phase 7:** Automated tests with Vitest, production build verification (`npm run build`), comprehensive README and verification reports.

---

## 5. External Service Dependencies

| Service | Purpose | Primary Endpoints | Credentials |
| :--- | :--- | :--- | :--- |
| **MapTiler Cloud** | Vector map tiles & base maps | `https://api.maptiler.com/maps/{style}/style.json` | `NEXT_PUBLIC_MAPTILER_KEY` |
| **MapTiler Geocoding** | Global place name lookup | `https://api.maptiler.com/geocoding/{query}.json` | `MAPTILER_GEOCODING_KEY` |
| **GraphHopper** | Turn-by-turn routing & distance | `https://graphhopper.com/api/1/route` | `GRAPHHOPPER_API_KEY` |
| **Supabase** | Auth & Postgres with RLS | `https://{project}.supabase.co` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |

---

## 6. Environment Variables Specification

```env
# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# MapTiler Map & Tile Credentials (browser-facing)
NEXT_PUBLIC_MAPTILER_KEY=
NEXT_PUBLIC_MAPTILER_STYLE_ID=streets-v2-dark

# MapTiler Geocoding (server-side only)
MAPTILER_GEOCODING_KEY=

# GraphHopper Routing Credentials (server-side only)
GRAPHHOPPER_API_KEY=
GRAPHHOPPER_PROFILE_CAR=car
GRAPHHOPPER_PROFILE_BIKE=bike
GRAPHHOPPER_PROFILE_FOOT=foot

# Supabase Auth & Storage
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 7. Security Considerations

- **No Secrets in Bundles:** Client code only references `NEXT_PUBLIC_*` keys. GraphHopper and private MapTiler geocoding calls occur via server routes.
- **Input Sanitization:** All incoming coordinates and text payloads are strictly validated using Zod schemas (`-90 <= lat <= 90`, `-180 <= lon <= 180`, description lengths, valid categories).
- **Supabase RLS:** All tables have Row Level Security enabled. User writes are strictly mapped to `auth.uid()`.
- **Attribution & Transparency:** OpenStreetMap and MapTiler attribution is visibly displayed on all map views. Real API statuses (configured vs unconfigured) are surfaced to the user without simulated falsehoods.

---

## 8. First-Release Acceptance Criteria

- [x] Clean Next.js 15 + TypeScript + Tailwind workspace.
- [ ] MapLibre interactive canvas renders real vector tiles with Hyderabad starting center.
- [ ] Responsive navigation sidebar & Mission Control HUD.
- [ ] Road-Network intelligence mode toggles and highlights actual road classifications.
- [ ] Search query autocomplete searches real places with coordinate normalization.
- [ ] Real route calculation computes route geometry, distance (km), and duration.
- [ ] Geolocation detects user's location with explicit user permission.
- [ ] Community reports modal saves reports and pins them onto the map.
- [ ] Saved locations feature allows bookmarking with custom labels.
- [ ] Production build succeeds without TypeScript or ESLint errors.
- [ ] Automated tests verify coordinate normalization, validators, and route formatting.
