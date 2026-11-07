# GEORYNTH — Product Experience Refinement Plan

**Tagline:** *"Find a place everyone can reach."*  
**Supporting Statement:** *"Less planning. More meeting."*  
**Date:** November 7, 2026  
**Status:** In Active Execution  

---

## 1. Before vs. After UX Transformation

| Dimension | Before (Phase 1/Early Phase 2) | After (Refined Product Experience) |
| :--- | :--- | :--- |
| **First Impression** | Technical telemetry dashboard with raw coordinate readouts and GIS controls. | Clean consumer welcome card: **Plan a Meetup**, **Join a Meetup**, **Explore Nearby**. |
| **Main Navigation** | 10 crowded items mixing developer telemetry with end-user tasks. | Streamlined 5-tab core navigation: **Plan**, **My Meetups**, **Explore**, **Saved Places**, **Settings**. |
| **Recommendation Explanations** | Arbitrary numerical fairness percentage score (e.g. "51% score"). | Transparent plain-English explanations: *"Only 8 min gap between closest and farthest participant"*, *"Equalizes travel time across Kukatpally, Secunderabad, Mehdipatnam, and Dilsukhnagar"*. |
| **Recommendation Modes** | Technical algorithmic labels (`fairest`, `fastest`, `best_rated`). | Consumer-friendly choices: **Fairest for Everyone**, **Quickest Overall**, **Best Group Match**. |
| **Preferences** | Basic category and budget dropdown. | Comprehensive group preferences with clear mandatory constraints vs. soft preferences (Cuisine, Dietary, Atmosphere, Max travel time, Transport). |
| **Map Role** | Dominant dark telemetry grid. | Rich Google Maps vector base providing visual grounding for participant origins, candidate venues, and route convergence. |
| **Mobile UX** | Fixed floating desktop panels. | Responsive bottom sheets, swipeable venue cards, accessible 44px+ touch targets, one-tap invite sharing. |

---

## 2. Implementation Checklist

- [x] Create UX refinement design document (`docs/ux-refinement-plan.md`).
- [ ] Update `MissionSidebar.tsx` to the 5 streamlined tabs: **Plan**, **My Meetups**, **Explore**, **Saved Places**, **Settings**.
- [ ] Refactor Welcome / First-Screen Hero Component into 3 clear primary action cards: **Plan a Meetup**, **Join a Meetup**, **Explore Nearby** with the new brand tagline.
- [ ] Upgrade `PlanMeetupModal.tsx` with rich preferences (Cuisine, Dietary requirements, Atmosphere, Max travel time, Mandatory constraints vs. Soft preferences).
- [ ] Update recommendation modes in `matrix.ts` and `MeetupWorkspace.tsx` to **Fairest for Everyone**, **Quickest Overall**, **Best Group Match** with transparent, plain-English travel explanations instead of arbitrary scores.
- [ ] Refine Candidate Venue Cards with clean visual hierarchy: name, cuisine, address, rating, individual friend travel times, group convenience tag, and voting controls.
- [ ] Optimize mobile viewport with responsive bottom-sheet drawers, touch-friendly buttons, and quick invite-link sharing.
- [ ] Verify TypeScript types and execute unit tests with Vitest.
