# GEORYNTH — Known Limitations & Operational Boundaries

**Document Version:** 1.0.0  
**Status:** First Release Telemetry  

---

## 1. External Credential Dependencies

### GraphHopper Directions API
- **Behavior:** GEORYNTH adheres strictly to the rule: *Never simulate successful route responses or invent travel times*.
- **When Unconfigured:** If `GRAPHHOPPER_API_KEY` is missing in `.env.local`, the `/api/route` endpoint returns HTTP 503 with a structured notice advising the operator to add their free or production API key from graphhopper.com.
- **Quota Exceeded:** Returns HTTP 429 with explicit instructions to retry once the rate-limit window resets.

### MapTiler Cloud Vector Tiles
- **Fallback Architecture:** When `NEXT_PUBLIC_MAPTILER_KEY` is not set, the platform loads high-contrast Dark Matter vector tiles from OpenFreeMap/OpenStreetMap, ensuring 100% exploration continuity without application disruption.
- **Attribution:** OpenStreetMap contributors and MapTiler copyright is permanently anchored to the bottom status bar across all viewport levels.

### Supabase Database & Auth
- **Fallback State:** In the absence of `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, community incident reports and saved places persist inside an active in-memory store.
- **Production Persistence:** Executing the SQL migrations located in `supabase/migrations/20261107000000_initial_schema.sql` enables full PostgreSQL persistence with Row Level Security (RLS).

---

## 2. Browser Geolocation Constraints
- Requires explicit user interaction (per product principle: *Never silently start background location tracking*).
- Requires a secure origin (`https://` or `http://localhost`).

---

## 3. Road-Network Intelligence Layer
- Relies on vector tile feature hierarchies (`motorway`, `trunk`, `primary`, `secondary`, `tertiary`) present in the source tiles.
- In geographic zones with lower OpenStreetMap detail, road classifications default to standard street vectors without artificial fabrication.
