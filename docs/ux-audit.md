# GEORYNTH — Professional UX Audit & Heuristic Evaluation
**Date:** November 7, 2026  
**Auditor:** Principal Product Architect & Lead Interaction Designer  
**Product:** GEORYNTH ("Find a place everyone can reach. Less planning. More meeting.")  
**Scope:** Complete Web Application, Mobile Adaptation, Visual Architecture, Information Architecture, and Accessibility.

---

## 1. Executive Summary

GEORYNTH has established strong technical foundations: live vector mapping (MapLibre + MapTiler Streets v2/Satellite/Dark), GraphHopper turn-by-turn routing, GraphHopper multi-origin matrix calculation, Supabase database storage with RLS, and a cross-platform Expo React Native app structure.

However, the user experience currently presents significant usability, visual, and interaction obstacles. The UI inherited aesthetics from a "Geospatial Mission Control / GIS" console, resulting in **oversized translucent dark overlays that obscure the map canvas, technical telemetry competing for attention, lack of an adaptive light theme, and insufficient guidance across the meetup creation and voting lifecycle**.

This document provides a systematic heuristic evaluation and user journey breakdown to guide the complete consumer redesign.

---

## 2. Comprehensive Usability Defect Inventory

| # | Usability Problem | Severity | User Impact | Heuristic / Principle Violated | Proposed Solution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Oversized Translucent Overlay Panels** | **Critical** | Floating meetup workspace cards (480px–520px wide) cover the map canvas, preventing users from seeing participant origins and candidate venue pins simultaneously. | *Visibility of system status & Minimal visual clutter* | Replace giant floating panels with a collapsible, responsive bottom-sheet (mobile) and contextual split-view sidebar (desktop) with adaptive map camera padding. |
| **2** | **Dark-Only Surface (No Adaptive Light Theme)** | **High** | Defaulting to a heavy `#080D13` dark theme feels intimidating to casual consumer users on sunny mobile displays or daylight desktop sessions. | *Consistency & Aesthetic integrity* | Implement a system-aware adaptive design system defaulting to a welcoming, warm light palette (`#F7F9F8` background, `#FFFFFF` surfaces, `#168B6D` primary teal) with switchable dark theme (`#0D1318`). Separate app theme from map vector style. |
| **3** | **Technical Telemetry in Consumer Space** | **Medium** | Bottom status bar exposes GIS coordinates (`POS: 17.2346° N, 78.3886° E`), `ZOOM: 8.1`, `PITCH: 35°`, and `BEARING: -10°`. Friends planning a hangout do not care about pitch or bearing. | *Match between system and real world* | Remove technical telemetry from consumer views entirely. Move provider connectivity status into an unobtrusive Profile / Settings indicator. |
| **4** | **Unclear First-Time vs Returning User Experience** | **High** | First-time visitors are presented with identical screens regardless of whether they have pending meetups or are visiting for the first time. Empty states lack actionable guidance. | *Recognition rather than recall & Error prevention* | Create distinct adaptive home screens: New users see welcoming value proposition ("Let's make a plan. Find somewhere your whole group will love.") and 3 core actions. Returning users see their upcoming plans and active invites. |
| **5** | **Meetup Workflow Lacks Step-by-Step Guidance** | **High** | The meetup planning modal throws all filters (category, budget, cuisine, dietary, travel time) into a single dense view without a progressive narrative. | *User control and freedom & Error prevention* | Restructure into a clean 3-step wizard: **Step 1: What are we doing?** (Category), **Step 2: When?** (Date/Time), **Step 3: Preferences** (Budget, cuisine, max travel time). |
| **6** | **Map Controls Lack Coherent Hierarchy** | **Medium** | Style switchers, pitch controls, reset north, locate me, and search bars compete at disparate screen coordinates without grouped hierarchy. | *Consistency and standards* | Consolidate map controls into a unified floating action column (Zoom, Recenter Group, Map Layer, My Location) positioned predictably at bottom-right or top-right. |
| **7** | **Venue Card Information Compression** | **Medium** | Venue cards try to show address, rating, prices, 4 participant travel times, fairness reason, and voting controls in cramped containers, causing text clipping. | *Aesthetic and minimalist design* | Redesign venue cards with clean visual hierarchy: Image/Hero, Name, Category, Group Fairness Pill, Expandable Participant Travel Times, and Prominent Vote Button. |
| **8** | **Recommendation Logic Explanation Gaps** | **Medium** | While arbitrary percentages were eliminated, the trade-offs between "Fairest for Everyone" vs "Quickest Overall" are not highlighted clearly enough in comparison views. | *Flexibility and efficiency of use* | Add clear comparison chips and a 1-sentence plain-English verdict on why a specific venue was ranked #1 for the active mode. |
| **9** | **Map Camera Not Coordinated with Sheet State** | **High** | When venue cards or sheets open or expand, the map center stays under the sheet, hiding the selected venue pin. | *Visibility of system status* | Add `map.easeTo({ padding: { bottom: sheetHeight } })` so candidate venues and routes remain perfectly centered in the visible viewport. |
| **10** | **Responsive Breakpoints & Touch Targets** | **High** | Desktop layouts cramp when resized to tablet/mobile viewports; buttons below 44px violate touch accessibility guidelines. | *Accessibility & Responsive design* | Enforce 44px minimum touch targets, gesture-friendly drag handles on bottom sheets, and responsive desktop two-column layouts. |

---

## 3. Heuristic Evaluation Summary

1. **Visibility of System Status:** Poor currently due to overlapping cards obscuring the map pins. Fixed via camera padding and clear status badges (Voting, Voted, Confirmed).
2. **Match Between System and Real World:** Converted from GIS jargon ("Matrix API", "Centroid", "Pitch/Bearing") to natural consumer language ("Fair meeting spot", "Average drive time", "Nobody travels over 30 mins").
3. **User Control and Freedom:** Users can easily edit meetup details, switch recommendation modes, change starting origins, or revoke voluntary location sharing at any time.
4. **Consistency and Standards:** Design tokens standardized around a 4px grid (4, 8, 12, 16, 20, 24, 32, 40px) with shared semantic colors across web and mobile.
5. **Error Prevention:** Required fields are validated inline; maximum travel times are capped realistically; missing route calculations fail gracefully with explanations rather than crashing.
6. **Recognition Rather Than Recall:** Participant names and avatars are consistently displayed beside their respective travel times; invite codes are 1-tap copyable.
7. **Accessibility:** Contrast ratios verified for WCAG AA (4.5:1 for body text, 3:1 for large headings) in both Light and Dark themes.

---

## 4. User Journey Mapping

### Journey A: First-Time User
1. **Entry:** Lands on clean, inviting homepage in light theme.
2. **Hook:** Sees headline *"Let's make a plan. Find somewhere your whole group will love."*
3. **Core Action:** Taps *"Plan a Meetup"*, *"Join a Meetup"*, or *"Explore Nearby"*.
4. **No Friction:** No forced registration or intrusive permission dialogs upfront.

### Journey B: Returning User
1. **Entry:** Lands on personalized dashboard.
2. **Context:** Sees active meetup card: *"Hyderabad Weekend Hangout — 3 votes cast, awaiting your vote"*.
3. **One-Tap Access:** Enters meetup cockpit immediately or triggers Quick Plan.

### Journey C: Meetup Creator
1. **Step 1:** Selects activity (Cafe, Restaurant, Cinema, etc.).
2. **Step 2:** Picks date & time (Today, Tomorrow, Custom).
3. **Step 3:** Sets optional preferences (Budget, cuisine, max travel time 30 mins).
4. **Share:** Receives 6-character code (`HYD789`) and 1-tap share link for WhatsApp/Messages.

### Journey D: Invited Participant
1. **Link Click:** Opens `https://georynth.app/meetup/HYD789` or `georynth://meetup/HYD789`.
2. **Lobby:** Enters display name and chooses starting point (1-tap GPS or manual neighborhood selection like Kukatpally).
3. **Privacy Assurance:** Clear note stating location is temporary and only visible to confirmed group members.

### Journey E: Independent Explorer
1. **Explore Tab:** Full-screen vector map opens with category chips (Restaurants, Cafes, Cinemas, Parks, Shopping).
2. **POI Inspection:** Taps a venue pin to view ratings, photos, and address.
3. **Conversion:** Option to *"Start a Meetup Here"* directly from any saved or explored place.

### Journey F: Recommendation Comparison
1. **Mode Switcher:** Switches between *Fairest for Everyone*, *Quickest Overall*, and *Best Group Match*.
2. **Inspect Route:** Taps a participant's travel time to highlight their specific road route on the map without cluttering the screen with all routes simultaneously.

### Journey G: Voting & Confirmation
1. **Cast Vote:** One-tap vote on candidate venue.
2. **Host Confirmation:** Host confirms the winning venue (*Roastery Coffee House*).
3. **Celebration & Directions:** Confirmed state unlocks individual turn-by-turn directions and 1-tap calendar addition.

---

## 5. Information Architecture & Content Distribution

```
+-----------------------------------------------------------------------------------+
|                                 GEORYNTH SHELL                                    |
|  - Logo + Tagline ("Find a place everyone can reach")                             |
|  - 5 Primary Destinations: Plan | My Meetups | Explore | Saved | Profile         |
|  - Adaptive Theme Switcher (System / Light / Dark)                                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  HOME SCREEN (Adaptive)                                                           |
|  - New User: "Let's make a plan", 3 Hero Actions, Value explanation               |
|  - Returning User: Active Meetup Hero Card, Upcoming Plans, Recent Groups         |
|                                                                                   |
|  MEETUP COCKPIT (Dual-Zone)                                                       |
|  Zone 1: Interactive Map Canvas (Full view, participant pins, venue pins)         |
|  Zone 2: Contextual Sheet/Sidebar (Roster, Fairness Mode Selector, Venue Cards)   |
|                                                                                   |
|  PLACE DETAILS MODAL                                                              |
|  - Provider-backed photos, address, rating, price level, opening hours            |
|                                                                                   |
|  SETTINGS & PROFILE                                                               |
|  - Default Transport Mode, Location Privacy (Approximate pin toggle), App Version |
+-----------------------------------------------------------------------------------+
```
