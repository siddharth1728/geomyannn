# GEORYNTH — Complete Product Redesign Implementation Plan
**Document Version:** 2.0.0  
**Target Release Date:** November 7, 2026  
**Auditor & Architect:** Principal Product Architect & Lead Interaction Designer  
**Status:** In Active Execution  

---

## 1. Overview & Strategy

This implementation plan directs the transformation of GEORYNTH from a dark-only GIS mission-control console into an **adaptive, welcoming, social group meetup and place-discovery platform** across **Web**, **iOS**, and **Android**.

---

## 2. Phase-by-Phase Execution Checklist

### [x] PHASE 0 — PROFESSIONAL UX AUDIT
- [x] Conduct systematic heuristic evaluation of existing UI/UX.
- [x] Identify top 10 usability defects (oversized translucent panels, technical telemetry, dark-only palette, cramped venue cards, lack of camera coordination).
- [x] Produce `docs/ux-audit.md`.
- [x] Produce `docs/redesign-specification.md`.
- [x] Update `docs/current-state-audit.md`.
- [x] Deliver `docs/implementation-plan.md`.

### [ ] PHASE 1 — DESIGN SYSTEM REFACTORING
- [ ] Implement adaptive theme engine supporting **System**, **Light** (default), and **Dark** modes with persistent `localStorage` preference.
- [ ] Define light palette (`#F7F9F8` background, `#FFFFFF` surface, `#168B6D` primary teal, `#628CCB` secondary blue).
- [ ] Define dark palette (`#0D1318` background, `#141D24` surface, `#65D7AE` primary emerald).
- [ ] Build reusable UI primitives: `Button`, `IconButton`, `FilterChip`, `Avatar`, `AvatarStack`, `Card`, `Modal`, `BottomSheet`.
- [ ] Ensure 44px minimum touch targets and WCAG AA contrast.

### [ ] PHASE 2 — WEB HOMEPAGE REDESIGN
- [ ] Create adaptive homepage supporting:
  - **New User State:** *"Let's make a plan. Find somewhere your whole group will love."*, 3 Hero Action Cards (Plan, Join, Explore), and micro-explainer.
  - **Returning User State:** Active meetup card, quick status, and fast-track action.
- [ ] Implement clean responsive top header with brand logo, tagline, theme toggle, and profile.
- [ ] Eliminate technical bottom status bar from consumer view.

### [ ] PHASE 3 — MAP EXPERIENCE REDESIGN
- [ ] Redesign MapLibre view so the map is never obscured by oversized fixed panels.
- [ ] Implement responsive contextual sidebar (desktop) and draggable sheet (mobile).
- [ ] Add camera viewport coordination (`easeTo` with bottom/left padding) so selected venue pins remain visible when panels expand.
- [ ] Group map controls into a unified, clean floating action column (Zoom, Recenter Group, Map Style, My Location).

### [ ] PHASE 4 — GUIDED MEETUP CREATION & LOBBY
- [ ] Refactor meetup creation into a guided 3-step wizard:
  - Step 1: Activity Category
  - Step 2: Date & Time (Today, Tomorrow, Custom)
  - Step 3: Preferences (Budget, cuisine, max travel time limit)
- [ ] Build interactive Lobby showing participant starting points with privacy indicators.
- [ ] Provide 1-tap invitation sharing (Copy Link, Web, WhatsApp).

### [ ] PHASE 5 — PLACE DISCOVERY & VENUE CARDS
- [ ] Integrate modular venue search with provider attribution (MapTiler, OSM, Foursquare adapter).
- [ ] Redesign venue cards with clear hierarchy: Name, Category, Rating, Group Fairness Pill, Individual Travel Time breakdown, and Vote button.

### [ ] PHASE 6 — GROUP INTELLIGENCE & COMPARISON
- [ ] Connect GraphHopper Matrix API across all participant origins.
- [ ] Provide 3 clear ranking modes:
  1. **Fairest for Everyone** (minimax travel disparity).
  2. **Quickest Overall** (minimum total/average time).
  3. **Best Group Match** (balanced rating, budget, and travel time).
- [ ] Enable single-route inspection on click so participants can preview their own route without screen clutter.

### [ ] PHASE 7 — GROUP DECISION WORKFLOW
- [ ] Implement interactive 1-tap voting with live tally.
- [ ] Add host confirmation action locking the final venue.
- [ ] Render celebratory final meetup card with individual converging directions and Google/Apple Maps links.

### [ ] PHASE 8 — PROFILE & SETTINGS
- [ ] Add user transport mode preference (Car, Bike, Foot).
- [ ] Add approximate location toggle (~500m fuzzing).
- [ ] Provide theme switcher and version status.

### [ ] PHASE 9 — NATIVE MOBILE REFINEMENT (`apps/mobile`)
- [ ] Synchronize theme tokens and screen hierarchy into Expo React Native app.
- [ ] Test with `expo-doctor` and Metro web bundler.

### [ ] PHASE 10 — VERIFICATION & RELEASE
- [ ] Run full unit tests (`npm test`).
- [ ] Run typecheck (`npm run typecheck`).
- [ ] Verify production Next.js build (`npm run build`).
- [ ] Push clean commits to GitHub.
