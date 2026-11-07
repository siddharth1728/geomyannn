# GEORYNTH — Current UI & Architectural Analysis
**Product:** GEORYNTH  
**Tagline:** Find a place everyone can reach. Less planning. More meeting.  
**Target Audience:** Students, young adults, friends, and community groups coordinating real-world meetups.

---

## 1. Executive Summary & Diagnostic Overview

The existing GEORYNTH interface has a strong geospatial engine (MapLibre GL JS v5, MapTiler vector styles, GraphHopper road matrix computation), but suffered from a **tactical GIS cockpit legacy**:
- The map was previously dominated by a floating opaque card (420px wide) placed directly over the center-left canvas.
- Telemetry readouts (`PITCH: 35.0°`, `BEARING: -10.0°`, raw coordinates) were displayed to consumers who just want to find where to hang out with friends.
- Navigation was split between redundant top pills, bottom bars, and floating controls.
- Information density was too high for quick decision-making: students on phones or laptops had to parse nested borders and technical duration stats rather than seeing quick badges like "18 min bike ride" or "Fair for all".

---

## 2. In-Depth Evaluation of the 15 Identified UX Defects

| # | UX Defect | Current Manifestation | Severity | Direct Remedy in Redesign |
|---|---|---|---|---|
| **1** | **Competing Navigation Elements** | Multiple Plan buttons, floating HUD headers, active meetup badges scattered across both header and panel headers. | High | Single unified 56px global header with 3 primary sections (`Explore`, `Meetups`, `Saved`) + one prominent `+ Plan Meetup` CTA. |
| **2** | **Excessively Large Overlays** | Floating left workspace card was `w-[420px]` opaque, covering ~40% of the visible map on 1366x768 screens without a permanent integrated column. | Critical | Shifted to an **integrated two-column shell** (Left 380px collapsible panel + Right full-bleed vector map canvas) with camera padding so POIs are never obscured. |
| **3** | **Information Density** | Every candidate venue showed 6 duration numbers (avg, min, max, disparity, total, per-person) simultaneously. | High | Progressive disclosure: Compact card shows **Primary** (Name, Category, Rating, Avg Time, Fairness Badge) and **Expandable** drawer for per-friend breakdown. |
| **4** | **Incorrect Visual Hierarchy** | Technical attributes (coordinates, algorithm IDs) had equal visual weight to venue names and addresses. | Medium | Visual hierarchy refactored: Large bold venue title (16px semi-bold) -> Address/Category (13px muted) -> Quick travel badge (12px bold green pill). |
| **5** | **Poor Map-to-Panel Proportions** | On small laptops (1366x768), opening the workspace left less than 55% usable map area. | High | Integrated side-dock with collapse toggle (`<` / `>`) and responsive breakpoints: Desktop (380px dock), Tablet (320px dock), Mobile (bottom drag sheet with 3 snap points: 15%, 45%, 85%). |
| **6** | **Weak Marker Differentiation** | People markers and venue markers used similar circular pins, causing visual confusion when 4 friends and 5 venues appeared together. | Critical | **People Markers**: Vibrant avatar discs with initials, transport mode icons (Car, Bike, Metro), and distinct colored rings. **Venue Markers**: Shaped badges with category icons (Coffee cup, Fork & Knife, Popcorn) + rank number (`#1`, `#2`, `#3`). |
| **7** | **Unclear Venue Selection** | Clicking a venue on the card did not trigger a synchronized spotlight / pin elevation on the map. | Medium | Bidirectional hover and active highlight: Clicking a venue smoothly flies the map camera to it, scales the pin to 1.3x with an animated pulse ring, and highlights the card. |
| **8** | **Excessive Nested Cards** | Cards inside cards with 3 layers of borders (`border border-border/60 bg-surface/40 p-3 rounded-xl`). | Medium | Clean flat surface hierarchy: Main panel surface (`bg-surface`) -> Single-layer item cards (`bg-surface-secondary` with `border-border/60`) -> No triple-nested boxes. |
| **9** | **Low-Contrast Text** | Dark mode had some `#718096` captions that failed WCAG AA on `#141D24` surfaces. | High | Upgraded all tokens to WCAG AAA contrast: `#A5B4BC` secondary text and `#F2F6F7` primary text on `#0D1318`/`#141D24`. |
| **10** | **Clipped Venue Details** | On smaller heights (e.g. 768px), the travel-time breakdown overflowed without scroll momentum. | High | Panel uses independent flex-col scrolling with custom slim scrollbars and sticky vote/confirm action footer. |
| **11** | **Inconsistent Surface Colours** | Mix of hardcoded `#1e293b` slate and custom hexes across different modals. | Medium | 100% tokenized CSS variables: `var(--color-surface)`, `var(--color-surface-secondary)`, `var(--color-border)`, `var(--color-primary)`. |
| **12** | **Confusing Controls** | Layer toggle, pitch toggle, style switcher, and zoom controls were split into 3 floating corners. | Medium | Grouped into a single clean vertical control stack in the bottom-right corner (Zoom In, Zoom Out, Locate Me, Recenter, Style Switcher). |
| **13** | **Poor Responsive Behaviour** | On mobile screens (<640px), the left modal covered 95% of the screen like a blocking sheet. | High | Mobile gets a native-style draggable bottom drawer (`MobileTabBar` + Sheet), leaving the top 50% map always visible and interactable. |
| **14** | **Developer Telemetry in Consumer View** | Pitch, bearing, zoom levels, raw lat/lng floating at bottom-center. | Critical | Telemetry eliminated from consumer HUD. Retained only in development mode or inside Profile & Settings > System Status diagnostics. |
| **15** | **Missing First-Time-User Guidance** | Empty map state left users wondering what to do first. | High | Replaced with an inviting, student-friendly **"Let's make a plan"** greeting card with 3 one-tap actions (*Plan a Meetup*, *Join with Code*, *Explore Nearby*) plus a 1-tap **Hyderabad 4-Friend Demo** fast track. |

---

## 3. Student & Social Usability Focus

Students care about:
1. **Speed**: "I don't want to fill 10 form fields; just give me a place between Gachibowli and Secunderabad in 2 clicks."
2. **Fairness**: "No one wants to travel 45 mins while someone else walks 2 mins down their street."
3. **Vibes & Budget**: Clear indicator of cost (₹ Budget vs ₹₹ Moderate) and activity (Chai, Biryani, Coffee study, Cinema, Outdoor hang).
4. **Instant Sharing**: 1-tap WhatsApp invite link or invite code they can drop into their group chat.
