# GEORYNTH — PERSISTENCE, REALTIME & SECURITY REPORT

**Product:** GEORYNTH Website  
**Date:** November 8, 2026  
**Auditor:** Principal Security Engineer & Database Architect  

---

## 1. Persistence Matrix: Local vs Cloud

To ensure absolute transparency and prevent unwarranted claims, here is the exact architectural breakdown of what is stored where:

| Entity | Storage Mechanism | Scope & Persistence | Cross-Device Sync | Offline Capable |
| :--- | :--- | :--- | :--- | :--- |
| **Meetup Metadata & Members** | Next.js API / In-Memory Store & Supabase `meetups` | Global across all sessions using the 8-character invite code | **Yes** (any device with code) | No |
| **Participant Starting Pins** | Next.js API / Supabase `meetup_locations` | Stored in active meetup context; 24-hr expiration | **Yes** (visible to group) | No |
| **Group Votes** | Next.js API / Supabase `meetup_votes` | Real-time aggregate count per meetup | **Yes** (visible to group) | No |
| **Confirmed Venue & Routes** | Next.js API / GraphHopper cache | Stored on meetup record | **Yes** (visible to group) | No |
| **Post-Meetup Reviews** | Next.js API `/api/meetups/[id]/feedback` + `localStorage` | Stored on server meetup record; cached locally | **Yes** (synchronized via API) | **Yes** (local cache) |
| **Saved Places (Bookmarks)** | Browser `localStorage` (`georynth_saved_places`) | Local to browser session; persists across refreshes | No (guest mode only) | **Yes** |
| **Theme & UI Preferences** | Browser `localStorage` (`georynth_theme`) | Local to browser session | No (device specific) | **Yes** |
| **Support Tickets** | Next.js API `/api/support` & Supabase `support_tickets` | Stored on server; reviewable by admin | **Yes** (server-stored) | No |

---

## 2. Authentication & Authorization Policies

### A. Invitation Code Security
- **Format:** 8-character alphanumeric string (`HYD-XXXX`).
- **Entropy:** $32^4 = 1,048,576$ combinations per city prefix, preventing accidental enumeration.
- **Expiration:** Meetup invite tokens expire automatically 7 days after creation.

### B. Location Privacy Protection
- **No Passive GPS Tracking:** The application never requests background geolocation permissions. Geolocation is requested strictly on user click ("Locate Me").
- **Voluntary & Coarse Starting Points:** Participants enter generalized neighborhood landmarks (e.g. "Kukatpally Housing Board", "Secunderabad Clock Tower") rather than exact home addresses.
- **Approximate Location Feature:** An optional toggle offsets coordinates by ~500m to preserve residential privacy.
- **Automatic Expiration:** Participant coordinate pins in the database have a 24-hour TTL (`expires_at`), after which they are expunged.

### C. Supabase Row-Level Security (RLS)
The database migration scripts in `supabase/migrations/` define strict RLS policies:
- `meetups`: Read allowed for active meetups (`expires_at > now()`).
- `meetup_locations`: Accessible only to members of that specific meetup.
- `meetup_votes`: Constrained to one unique active vote per member (`UNIQUE(meetup_id, member_id)`).

---

## 3. Data Purge & User Reset Verification

- **Action:** *"Reset Storage & History"* in Profile & Settings.
- **Confirmation:** Features a red confirmation modal explaining that the action is irreversible for local bookmarks.
- **Scope of Deletion:**
  - `localStorage.removeItem("georynth_saved_places")`
  - `localStorage.removeItem("georynth_theme")`
  - Purges all cached `georynth_feedback_*` keys.
- **Server Preservation:** Does NOT corrupt or delete active meetups hosted on the server, ensuring friends can continue collaborating even if one member resets their browser cache.
