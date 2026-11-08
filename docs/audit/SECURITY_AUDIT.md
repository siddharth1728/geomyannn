# GEORYNTH — Comprehensive Security & Privacy Audit

**Audit Date:** November 8, 2026  
**Auditor:** Principal Security Engineer & Infrastructure Auditor  
**Audit Scope:** Credential Management, Authentication Architecture, Database Access Control (RLS), API Route Authorization, Location Privacy, and Data Retention.  
**Classification:** STRICT AUDIT REPORT (No secret values printed).

---

## 1. Executive Summary

GEORYNTH's security posture is currently in a **HIGH-RISK STATE**. While the frontend code demonstrates thoughtful privacy concepts (such as approximate location toggles and short-lived expiration timestamps in data models), the application has critical security vulnerabilities that must be resolved prior to any production deployment:

1. **Third-Party API Secrets Hardcoded in Source Code**: Active GraphHopper and MapTiler API keys are committed directly to public source code files and pushed to GitHub.
2. **Missing User Authentication & Identity Verification**: The application currently has no real authentication system. All operations execute anonymously or assume a hardcoded user identity (`"user-me"` / `"Siddharth"`).
3. **Flawed Row-Level Security (RLS) Policies**: The database migrations contain wildcard `USING (true)` policies that allow any anonymous user to overwrite or delete other members' locations, votes, and meetups.
4. **Unapplied Database Migrations**: The remote Supabase database instance lacks the required tables, resulting in completely bypassed database security.

---

## 2. Vulnerability Findings & Severity Breakdown

### Finding SEC-01: Hardcoded Third-Party API Secrets in Git Repository
- **Severity**: **P0 — Critical**
- **Affected Files**:
  - `src/lib/providers/graphhopper.ts` (Line 22)
  - `src/lib/providers/matrix.ts` (Line 38)
  - `src/lib/providers/maptiler.ts` (Line 24)
  - `src/lib/map/config.ts` (Line 7)
  - `src/lib/supabase/client.ts` (Line 8)
  - `src/lib/supabase/server.ts` (Line 9)
  - `src/app/api/status/route.ts` (Lines 10, 13)
  - `.env.local`
- **Description**: Private API keys for GraphHopper (a paid routing service) and MapTiler (tile provider) are hardcoded as string literals as fallback values in application source code. Because these files have been committed to git and pushed to a public GitHub repository, these credentials are fundamentally compromised.
- **Impact**: Any individual with access to the GitHub repository can extract these keys, exhaust the account's monthly routing quota, run up unexpected financial charges, or perform unauthorized spatial queries.
- **Remediation**:
  1. Immediately rotate the compromised GraphHopper API Key and MapTiler API Key in their respective provider consoles.
  2. Remove all hardcoded credential string literals from all TypeScript source files.
  3. Require credentials strictly from environment variables (`process.env.*`) and throw an error if missing.
  4. Use git credential scrubbing tools (e.g., `git-filter-repo` or BFG Repo-Cleaner) to purge historical commits from GitHub.

---

### Finding SEC-02: Complete Absence of User Authentication
- **Severity**: **P0 — Critical**
- **Affected Files**:
  - `src/components/auth/AuthModal.tsx`
  - `src/app/api/meetups/route.ts`
  - `src/app/api/meetups/[id]/votes/route.ts`
  - `src/app/api/meetups/[id]/confirm/route.ts`
- **Description**: Despite having a component named `AuthModal.tsx`, the component contains no authentication code (no email sign-in, no OAuth, no password verification, no Supabase Auth session token validation). It is merely a UI preferences dialog. All API routes accept arbitrary `creatorId`, `memberId`, or `userId` values from client request bodies without verifying the requester's actual identity.
- **Impact**: Any user can impersonate another group member, cast votes in their name, confirm meetups on behalf of the creator, or modify group parameters.
- **Remediation**:
  1. Integrate Supabase Auth (`@supabase/ssr` / `@supabase/supabase-js`) with email magic links or social OAuth (Google/Apple).
  2. Implement an authentication session provider in React context.
  3. Validate JWT bearer tokens on all mutating API route handlers (`POST /api/meetups`, `POST /api/meetups/[id]/votes`, etc.) using `supabase.auth.getUser()`.

---

### Finding SEC-03: Permissive and Broken Database RLS Policies
- **Severity**: **P0 — Critical**
- **Affected Files**:
  - `supabase/migrations/20261107000001_meetup_system.sql` (Lines 40-58, 74-91, 111-135, 188-211)
- **Description**: The SQL migration defining the meetup tables contains policies that defeat the purpose of Row-Level Security:
  ```sql
  -- Line 52: Creator can update meetup (Permits anyone to update!)
  CREATE POLICY "Creator can update meetup" ON public.meetups FOR UPDATE TO public USING (true) WITH CHECK (true);

  -- Line 86: Member can leave (Permits anyone to delete any member!)
  CREATE POLICY "Member can leave" ON public.meetup_members FOR DELETE TO public USING (true);

  -- Line 130: Members can revoke location (Permits anyone to delete any location!)
  CREATE POLICY "Members can revoke location" ON public.meetup_locations FOR DELETE TO public USING (true);

  -- Line 123: Members can update location (Permits anyone to overwrite anyone's location!)
  CREATE POLICY "Members can update location" ON public.meetup_locations FOR UPDATE TO public USING (true) WITH CHECK (true);
  ```
- **Impact**: Because the policies check `USING (true)` for public roles without checking `auth.uid()`, any client with the Supabase anon key can send direct SQL/REST queries to delete other participants, overwrite other users' locations, or cancel other people's meetups.
- **Remediation**:
  1. Restrict table operations to authenticated users (`TO authenticated`).
  2. Enforce strict ownership checks:
     - `meetups` UPDATE: `USING (auth.uid()::text = creator_id)`
     - `meetup_members` DELETE: `USING (auth.uid()::text = user_id)`
     - `meetup_locations` UPDATE/DELETE: `USING (auth.uid()::text = member_id)`
     - `meetup_votes` INSERT/UPDATE: `USING (auth.uid()::text = member_id)`

---

### Finding SEC-04: Server-Side Fallback to Anon Key in `getSupabaseServerClient`
- **Severity**: **P1 — High**
- **Affected Files**:
  - `src/lib/supabase/server.ts` (Lines 6-9)
- **Description**: In `server.ts`:
  ```typescript
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "...";
  ```
  When `SUPABASE_SERVICE_ROLE_KEY` is not defined in `.env.local`, the server client falls back to the browser publishable/anon key.
- **Impact**: Server-side administrative operations fail or get blocked by client RLS rules because the server does not possess service-role authority. If administrative operations need elevated rights (such as cleaning up expired meetups or executing batch matrix jobs), they will be rejected by RLS.
- **Remediation**: Separate client-scoped server queries (passing user session cookies) from administrative tasks (strictly requiring `SUPABASE_SERVICE_ROLE_KEY`). Never conflate the anon key with the service role key.

---

### Finding SEC-05: Missing Rate Limiting on Public API Endpoints
- **Severity**: **P1 — High**
- **Affected Files**:
  - `src/app/api/route/route.ts`
  - `src/app/api/meetups/[id]/matrix/route.ts`
  - `src/app/api/geocode/route.ts`
  - `src/app/api/meetups/route.ts`
- **Description**: The Next.js API routes have no IP-based rate limiting, proof-of-work, or request quotas. A malicious actor can write a simple loop script sending thousands of requests per second to `/api/route` or `/api/meetups/[id]/matrix`.
- **Impact**: Complete denial of service (DoS) and rapid exhaustion of GraphHopper and MapTiler monthly API quotas, rendering the application inoperable for legitimate users.
- **Remediation**: Implement edge rate limiting using Upstash Redis or Vercel KV with token-bucket rate limiting (e.g., maximum 20 routing requests per IP per minute).

---

### Finding SEC-06: Location Privacy and Data Retention Exposure
- **Severity**: **P2 — Medium**
- **Affected Files**:
  - `src/types/meetup.ts`
  - `supabase/migrations/20261107000001_meetup_system.sql`
- **Description**:
  1. The schema defines an `expires_at` column defaulting to 24 hours for `meetup_locations`, but **no automated background worker, pg_cron job, or trigger exists** to actually delete expired locations from the database.
  2. Locations are stored with full double-precision GPS accuracy (`17.4947000, 78.3996000`), allowing exact home address identification. While an `is_approximate` boolean flag exists on the type, the server does not apply mathematical coordinate fuzzing (e.g. adding 500m random noise) when `is_approximate` is true.
- **Impact**: Sensitive home starting locations remain in memory and storage indefinitely without automated purging, exposing users to location privacy leakage.
- **Remediation**:
  1. Implement a scheduled cron job (or Supabase `pg_cron` extension) to purge records where `expires_at < now()`.
  2. Implement server-side coordinate fuzzing for approximate locations: truncate coordinates to 2 decimal places (~1.1 km precision) before storing.

---

## 3. Summary of Security Posture

| Dimension | Evaluation | Risk Level |
|:---|:---|:---|
| **Secret Management** | Hardcoded keys in git repository | **CRITICAL** |
| **Authentication** | Non-existent; anonymous execution | **CRITICAL** |
| **Access Control (RLS)** | Inactive / Broken `USING (true)` policies | **CRITICAL** |
| **API Protection** | No rate-limiting; public endpoints | **HIGH** |
| **Location Privacy** | Expiration defined but not enforced | **MEDIUM** |
| **Input Validation** | Good (Zod schemas implemented in route handlers) | **LOW** |
