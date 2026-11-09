# GEORYNTH — Provider Accuracy & Truthful Geodata Verification
**Document ID:** PROV-ACC-20261109  
**Branch:** `fix/vercel-production-blockers`  
**Status:** Remediated & Verified

---

## 1. Objective

To eliminate synthetic, fabricated, or simulated provider data and ensure GEORYNTH presents truthful, verified geographical information to users.

---

## 2. Issues Discovered & Remediations Applied

### 2.1 Venue Discovery & Attribute Fabrication
- **Issue:** `src/lib/providers/venues.ts` previously assigned synthetic ratings using an index formula: `4.3 + (idx % 5) * 0.1` and synthetic price levels based on `idx % 2 === 0`. Furthermore, the Nominatim query was hardcoded to `"restaurant in Hyderabad"`, ignoring the actual geographical centroid of the meetup group.
- **Remediation:**
  - Removed all index-based rating and price generation formulas.
  - When real ratings or price data are not supplied by the provider (such as OpenStreetMap Nominatim), they are left honest as `undefined`.
  - The UI component (`VenueCard.tsx`) already renders ratings conditionally (`{venue.rating && ...}`), displaying clean venue cards without inventing false ratings.
  - Replaced the hardcoded Hyderabad query with dynamic centroid calculation:
    - Calculates geographic centroid `(lat, lon)` of all participant locations.
    - Constructs an explicit `viewbox` bounding box around the centroid (`±0.08°` / ~8.8 km).
    - Queries Nominatim with `bounded=1` and `viewbox` to ensure discovered venues actually exist in the vicinity of the group's meetup area.

### 2.2 Routing Integrity & Synthetic Route Elimination
- **Issue:** In `src/app/api/meetups/[id]/confirm/route.ts`, when GraphHopper routing was unavailable or failed, a synthetic 3-point straight-line GeoJSON geometry was constructed with an invented 10 km distance and 20-minute duration.
- **Remediation:**
  - Removed the fallback route generator.
  - If GraphHopper fails or coordinates are unroutable, `route` is returned honestly as `null` with a clear status message (`"Live route geometry unavailable"`).
  - The map component handles `null` route geometry gracefully without crashing or drawing false lines through buildings.

### 2.3 Distance Matrix Unroutable Cell Handling
- **Issue:** In `src/lib/providers/matrix.ts`, missing or null matrix durations from GraphHopper were previously coerced to 0, skewing travel averages and leading to false recommendations.
- **Remediation:**
  - Matrix response processing now verifies that durations are positive numbers.
  - Unroutable pairs are set to a penalty duration (`999999`) and flagged in `participantTimes` as unroutable.
  - A venue where one or more participants cannot be routed is marked with an unroutable warning and excluded from top fairness recommendations.

---

## 3. Unit Test Verification

- `src/lib/providers/matrix.test.ts` verified:
  - Valid GraphHopper matrix response parsing (3/3 tests passed).
  - Handling of unavailable provider response (returns empty venue set, never fabricated times).
  - Strict positive number validation.
- `packages/domain/src/fairness.test.ts` verified:
  - 6/6 tests passed including equal journey times, unequal journeys, and edge case handling.
