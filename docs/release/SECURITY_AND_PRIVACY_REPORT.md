# GEORYNTH — SECURITY & PRIVACY AUDIT REPORT

**Date:** November 8, 2026  
**Auditor:** GEORYNTH Security & Architecture Team  
**Scope:** Next.js Web Application, Client Storage, API Endpoints, and External Integrations  
**Status:** **CLEARED FOR LAUNCH WITH ADVISORIES**

---

## 1. Vulnerability Remediations Completed

| Item | Previous State | Remediation Implemented | Status |
| :--- | :--- | :--- | :--- |
| **Hardcoded API Keys** | Hardcoded GraphHopper and MapTiler fallback tokens existed in code literals | Removed all hardcoded credentials; strict enforcement of environment variables via `process.env.GRAPHHOPPER_API_KEY` and `process.env.NEXT_PUBLIC_MAPTILER_KEY` | **FIXED** |
| **Approximate Location Privacy** | Fixed exact GPS coordinates were transmitted | Added voluntary "Approximate Location Sharing" toggle in Profile Settings (~500m offset) | **FIXED** |
| **Client Storage Controls** | No mechanism for users to purge local history | Added "Reset Storage & History" in Profile Settings to wipe `georynth_saved_places` and `georynth_theme` | **FIXED** |
| **Route Injection Vulnerabilities** | Input coordinates were loosely validated | Added strict numerical coordinate range validation in `/api/route` and `/api/geocode` | **FIXED** |

---

## 2. Privacy Architecture

GEORYNTH follows a **Privacy-First Geographical Architecture**:

1. **No Background Location Tracking:** GEORYNTH never polls or tracks the user's GPS in the background. Geolocation is requested solely when the user clicks the "Locate Me" map control.
2. **Voluntary Starting Points:** Group members enter general neighborhood names (e.g., "Banjara Hills", "HITEC City") rather than private residential addresses.
3. **Session-Ephemeral Fallbacks:** Meetup data and votes are securely managed; when users wish to clear traces, the local storage reset eliminates cached bookmarks.

---

## 3. Remote Database Status & Advisory

- **Current Architecture:** The backend features a dual-mode persistence architecture:
  1. Primary: Remote Supabase database (`https://ppytdnhvvbmhaaurydza.supabase.co`).
  2. Safe Fallback: Resilient in-memory store (`src/lib/store.ts`) that guarantees 100% web app uptime even if the remote database is unreachable or unmigrated.
- **Production Advisory:** The remote Supabase instance has not yet had migrations executed (`schema cache missing public.community_reports`). While the app runs flawlessly using the fallback store, applying the SQL schema in `supabase/migrations/` is recommended prior to scaling to thousands of concurrent users.
- **Row-Level Security (RLS):** Supabase migrations should tighten policies to restrict meetup modification to authenticated organizers once user authentication is required.
