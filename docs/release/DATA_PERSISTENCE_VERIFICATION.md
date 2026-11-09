# GEORYNTH — Data Persistence Verification Report
**Document ID:** DATA-PERSIST-20261109  
**Branch:** `fix/vercel-production-blockers`  
**Status:** Remediated & Verified

---

## 1. Background & Persistence Architecture

In previous iterations, GEORYNTH used an in-memory `Map` store as the primary state container. In a serverless deployment like Vercel, memory stores are destroyed when lambdas cycle, resulting in data loss across user sessions and server restarts.

To ensure production-grade data persistence, Supabase PostgreSQL is established as the authoritative database backing all entities, while keeping a local in-memory cache for speed and non-production testing.

---

## 2. Database Migration Specification

Migration script: `supabase/migrations/20261109000000_production_remediation.sql`

The migration introduces and normalizes:
1. `meetups`: Authoritative meetup records with expiration timestamps, status, transport mode, and confirmed venue reference.
2. `meetup_members`: Participant associations with roles (`creator`, `member`) and join timestamps.
3. `meetup_locations`: User starting locations with coordinate range checks, approximate mode flag, and TTL expiration.
4. `meetup_shortlists`: Cached candidate venues and travel-time metrics calculated by the matrix engine.
5. `meetup_votes`: Unique member-venue votes with composite primary key `(meetup_id, member_id)` preventing duplicate voting.
6. `meetup_decisions`: Confirmed venue record, chosen recommendation mode, and audit timestamp.
7. `meetup_feedback`: Post-meetup participant ratings, travel accuracy ratings, and venue suitability feedback.
8. `support_tickets`: Customer assistance requests with category, user email, message, and resolved status.

### Row Level Security (RLS) Policies
- Strict RLS is enabled on all tables.
- `meetup_members` can only read and write within meetups they belong to.
- `meetup_locations` coordinates are accessible only to registered members of that meetup.
- `support_tickets` SELECT policy is restricted to service role and authenticated administrative users.

---

## 3. Store Synchronization & Production Fixture Isolation

### Store Updates in `src/lib/meetups/store.ts`
- **Read Path (`fetchMeetupByIdOrCode`):**
  - First queries Supabase PostgreSQL for the authoritative state.
  - Hydrates members, locations, candidate venues, and votes.
  - Updates in-memory cache with retrieved cloud data.
- **Write Path:**
  - `createMeetup`: Persists to Supabase `meetups` and `meetup_members`.
  - `addMemberToMeetup`: Upserts into `meetup_members`.
  - `setParticipantLocation`: Upserts into `meetup_locations` with conflict handling on `(meetup_id, member_id)`.
  - `recordVote`: Upserts into `meetup_votes` on `(meetup_id, member_id)`.
  - `confirmMeetupVenue`: Updates `meetups` with `confirmed_venue_id` and `status = 'confirmed'`.
  - `recordMeetupFeedback`: Inserts into `meetup_feedback`.
- **Production Fixture Guard:**
  - Demo fixture seeding is gated behind `if (process.env.NODE_ENV !== "production")`.
  - In production builds, empty or real databases are never overwritten with synthetic Hyderabad demo members.
