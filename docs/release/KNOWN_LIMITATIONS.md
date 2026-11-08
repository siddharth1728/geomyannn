# GEORYNTH — KNOWN LIMITATIONS & PRODUCT TRADEOFFS

**Product:** GEORYNTH Website  
**Date:** November 8, 2026  
**Version:** 1.0.0 (Web)

---

## 1. Provider & External API Constraints

### A. GraphHopper Free Tier Limits
- **Constraint:** The default GraphHopper community tier allows up to 500 requests per day and a maximum of 5x5 matrix dimensions per single call.
- **Impact:** Group meetups with more than 5 starting locations and 5 candidate venues will fall back to simulated driving durations if API quota is reached.
- **Mitigation:** The application catches HTTP 429/quota errors gracefully and falls back to distance-based mathematical estimations without crashing. Production deployment should upgrade to GraphHopper Standard or Enterprise tier.

### B. MapTiler Map Styles
- **Constraint:** Vector map rendering requires an active MapTiler API key. If `NEXT_PUBLIC_MAPTILER_KEY` is invalid or expired, the map displays OpenStreetMap raster fallback tiles.
- **Mitigation:** The application auto-detects MapTiler health via `/api/status` and informs the user in the Profile & Settings dialog.

### C. OpenStreetMap (Nominatim) Venue Ratings
- **Constraint:** OpenStreetMap point-of-interest data does not natively store Google-style customer ratings or price levels.
- **Impact:** Venue ratings in discovery are procedurally generated based on venue attributes (e.g., 4.3 - 4.7 stars).
- **Future Roadmap:** Integrate Google Places API or Foursquare Places API for real-time customer reviews, photos, and live opening hours.

---

## 2. In-Memory Store vs Remote Supabase

- **Constraint:** When the remote Supabase database tables are unmigrated, meetups created via the web app are stored in Node.js server memory (`src/lib/store.ts`).
- **Impact:** In-memory meetups will reset if the Next.js server restarts (e.g. cold restart on serverless functions).
- **Mitigation:** Running `supabase db push` against the live Supabase instance will establish permanent PostgreSQL persistence.
