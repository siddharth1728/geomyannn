# GEORYNTH — Vercel Pre-Deployment Audit Report
**Branch:** `fix/vercel-production-blockers`  
**Base Commit:** `fa9ea97`  
**Date:** November 9, 2026  
**Status:** Remediated & Ready for Review (Do NOT push to main or deploy until approved)

---

## 1. Executive Summary

Prior to production deployment on Vercel, a comprehensive audit identified critical security, authentication, privacy, data persistence, and provider integrity blockers across the application. 

All identified blockers have been systematically addressed on the isolated remediation branch `fix/vercel-production-blockers` without regressing the interactive UI, domain ranking logic, or user experience.

---

## 2. Identified Blockers & Remediation Summary

| Priority | Issue / Risk Area | Original Defect | Remediation Applied | Status |
|---|---|---|---|---|
| **Priority 0** | Credential Exposure | Hardcoded API keys and Supabase tokens in `src/app/api/status/route.ts`, `src/lib/providers/maptiler.ts`, `src/lib/providers/graphhopper.ts`, `matrix.ts`, `config.ts`, `supabase/client.ts`, `supabase/server.ts`, and docs. | Removed all literal tokens from tracked source and markdown files; `.env*` excluded in `.gitignore`; keys flagged for revocation and rotation. `/api/status` now verifies environment existence dynamically without secrets. | **RESOLVED** |
| **Priority 1** | API Auth & Authorization | Meetup mutation routes accepted arbitrary client-provided `userId` / `memberId`; endpoints lacked membership checks and rate limiting. | Introduced `getSessionUser` and membership validator in `src/lib/auth/session.ts`. Endpoints derive user identity from verified cookies. Token bucket rate limiter applied to all provider proxies. | **RESOLVED** |
| **Priority 2** | Customer Data Protection | `GET /api/support` exposed user emails and issue descriptions to unauthenticated callers. | Added administrative authorization guard (`ADMIN_API_KEY` header or verified admin role). Rate limited `POST /api/support` to 5 requests per 10 minutes to stop spam. | **RESOLVED** |
| **Priority 3** | Database Persistence | In-memory store was authoritative; Supabase calls were secondary or missing; production environment would lose data between serverless invocations. | Authored migration `20261109000000_production_remediation.sql` with tables for invites, shortlists, decisions, feedback, support tickets, and strict RLS. Configured Supabase queries and async mutations in `store.ts`. Disabled demo seed in production (`NODE_ENV === "production"`). | **RESOLVED** |
| **Priority 4** | Real Venue Accuracy | Venues contained synthetic ratings (`4.3 + (idx % 5) * 0.1`) and price levels based on array index. Venue search was hardcoded to Hyderabad. | Removed fabricated ratings and price levels. Nominatim query now dynamically computes a bounding box around the group's geographical centroid. Missing ratings remain honest (`undefined`). | **RESOLVED** |
| **Priority 5** | Routing Integrity | Route confirmation generated synthetic straight-line 3-point LineStrings when GraphHopper failed; unroutable matrix cells were coerced to 0. | Eliminated fake route generation; unroutable pairs return explicit `null` and honest errors. Matrix cells preserve error state and mark unroutable destinations explicitly. | **RESOLVED** |
| **Priority 6** | Vercel Build Compatibility | Monorepo / build paths required validation for standard Vercel Next.js pipelines. | Confirmed clean root Next.js 15 build, standard `.env.example`, no custom unsupported build commands required. | **RESOLVED** |
| **Priority 7** | Verification Suite | TypeScript errors, broken tests, missing security regression tests. | Verified `npm run typecheck` (0 errors), `npm test` (15/15 passed), Next.js production build (`npm run build`). | **RESOLVED** |

---

## 3. Environment Variable Specification for Vercel

The following variables must be configured in Vercel Project Settings (Production & Preview):

| Variable | Scope | Requirement / Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Production, Preview | Public URL of the deployment (e.g. `https://georynth.vercel.app`) |
| `NEXT_PUBLIC_MAPTILER_KEY` | Production, Preview | Client-side vector tile key (domain-restricted in MapTiler console) |
| `NEXT_PUBLIC_MAPTILER_STYLE_ID` | Production, Preview | Style identifier (e.g., `streets-v2-dark` or `basic-v2`) |
| `MAPTILER_GEOCODING_KEY` | Server-only | Geocoding API key for server proxy |
| `GRAPHHOPPER_API_KEY` | Server-only | GraphHopper routing API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Supabase project URL (`https://<project-ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production, Preview | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Supabase service role key for administrative endpoints |
| `ADMIN_API_KEY` | Server-only | Secret key for administrative access to support tickets |
