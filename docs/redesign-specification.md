# GEORYNTH — Complete Product Redesign Specification
**Product:** GEORYNTH  
**Tagline:** Find a place everyone can reach.  
**Supporting Tagline:** Less planning. More meeting.  
**Target Release:** Adaptive Consumer Release (November 7, 2026)  
**Platforms:** Web (Next.js 15), iOS & Android (Expo SDK 52 React Native)

---

## 1. Design System & Tokens

### 1.1 Color Tokens

The visual system is **adaptive, system-aware, and defaults to a welcoming light theme** for first-time visitors. The application theme is decoupled from the map vector style, so users can view a standard street map or satellite map under either app theme.

#### Light Theme (Default Consumer Experience)
```css
:root {
  --background: #F7F9F8;
  --surface: #FFFFFF;
  --surface-secondary: #F0F4F2;
  --surface-elevated: #FFFFFF;

  --text-primary: #17211F;
  --text-secondary: #62716C;
  --text-muted: #8A9792;

  --primary: #168B6D;
  --primary-hover: #117458;
  --primary-soft: #E3F5EE;

  --secondary: #628CCB;

  --success: #188B61;
  --warning: #B67D29;
  --danger: #CE5962;

  --border: #E3EAE6;
  --border-subtle: #EEF3F0;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 12px 28px rgba(0, 0, 0, 0.1);
}
```

#### Dark Theme
```css
[data-theme="dark"] {
  --background: #0D1318;
  --surface: #141D24;
  --surface-secondary: #1C2730;
  --surface-elevated: #202D36;

  --text-primary: #F2F6F7;
  --text-secondary: #A5B4BC;
  --text-muted: #758792;

  --primary: #65D7AE;
  --primary-hover: #83E4C3;
  --primary-soft: #18392F;

  --secondary: #83B6E8;

  --success: #65CBA3;
  --warning: #E7B86B;
  --danger: #ED858B;

  --border: #2A3840;
  --border-subtle: #1F2A32;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 12px 28px rgba(0, 0, 0, 0.5);
}
```

### 1.2 Typography System

- **Typeface:** Inter / Geist for Web; System Sans (San Francisco on iOS, Roboto on Android) for Mobile.
- **Tabular Numbers:** Required (`font-variant-numeric: tabular-nums`) for travel times (e.g. `24 min`), distances (`12.3 km`), and prices (`₹650`).
- **Scale:**
  - **Display:** 32px / 38px line height, Weight 800, tracking -0.02em
  - **Page Title:** 24px / 30px line height, Weight 700, tracking -0.01em
  - **Section Title:** 18px / 24px line height, Weight 700
  - **Card Title:** 15px / 20px line height, Weight 600
  - **Body Text:** 14px / 20px line height, Weight 400 & 500
  - **Secondary Body:** 13px / 18px line height, Weight 400
  - **Caption & Badges:** 11px / 16px line height, Weight 600, tracking +0.02em

### 1.3 Spacing Grid

Base unit: **4px**  
- Values: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`.
- Minimum Interactive Touch Target: **44px × 44px**.

---

## 2. Screen-by-Screen Specifications

### Screen 1: Home (Adaptive)
- **Top Header:** Clean brand mark, tagline *"Find a place everyone can reach"*, theme toggle (System/Light/Dark), and Profile avatar.
- **New User Journey:**
  - Hero prompt: *"Let's make a plan. Find somewhere your whole group will love."*
  - 3 Core Action Cards:
    1. **Plan a Meetup:** Guided 3-step creation.
    2. **Join a Meetup:** Enter 6-character code or link.
    3. **Explore Nearby:** Browse local cafes, food, and activities.
  - Explanatory micro-stepper: 1. Pick activity → 2. Invite friends → 3. Find fair spot.
- **Returning User Journey:**
  - Active Meetup Card: Displays pending votes, confirmed status, or voting progress.
  - Quick Plan Action Button.
  - Recent meetups & saved places.

### Screen 2: Create Meetup (3-Step Guided Wizard)
- **Step 1: What are we doing?** Category chips (Restaurants, Cafes, Movies, Shopping, Parks, Gaming, Sports, Activities).
- **Step 2: When?** Today, Tomorrow, or Custom Date/Time picker respecting local timezone.
- **Step 3: Preferences (Optional):**
  - Budget per person (₹ Budget, ₹₹ Moderate, ₹₹₹ Premium).
  - Maximum travel time cap (e.g. 30 mins) with hard vs soft constraint toggle.
  - Dietary requirements (Vegetarian, Halal, Vegan, Any).
- **Summary Preview:** Shows quick summary before generating invite code.

### Screen 3: Invitations & Sharing
- **Invite Code:** High-contrast 6-character alphanumeric code (e.g. `HYD789`).
- **Share Link:** `https://georynth.app/meetup/HYD789` and `georynth://meetup/HYD789`.
- **Action Triggers:** 1-tap Copy Link, Native Share Sheet, and WhatsApp direct share link.

### Screen 4: Meetup Lobby
- Participant roster with active location sharing status.
- Voluntary location picker:
  - 1-tap device GPS location.
  - Or manual starting area selector (Kukatpally, Secunderabad, etc.).
  - Privacy indicator explaining that coordinates expire automatically.

### Screen 5: Map Discovery (Flagship Visual Experience)
- **Map Viewport:** 100% visible vector canvas (streets-v2, satellite, dark).
- **Marker Styling:**
  - Participant Origin Pins: Round avatar with initial and clean name badge.
  - Candidate Venue Pins: Category icon with live rating badge.
  - Selected Venue Pin: Highlighted with emerald beacon.
- **Unified Floating Controls:** Bottom-right or top-right cluster (Zoom +, Zoom -, Recenter Group, Map Style, My Location).
- **Camera Coordination:** When sheet expands, `map.easeTo({ padding: { bottom: sheetHeight } })` shifts the center so pins stay visible.

### Screen 6: Place Discovery
- Provider-backed real venues from Foursquare / MapTiler / OpenStreetMap.
- Radius search around group centroid with category filters.

### Screen 7: Premium Venue Cards
- Venue image or category badge.
- Venue name, rating (e.g. `★ 4.7`), address, and price level.
- **Fairness Badge:** e.g. *"Balanced central location with an average drive time of 22 minutes."*
- **Individual Travel Time Breakdown:** Expandable row showing travel times for Aarav, Diya, Rohan, Ananya.
- **Action Buttons:** Vote button and Host Confirm button.

### Screen 8: Travel Comparison
- 3 Recommendation Modes:
  1. **Fairest for Everyone:** Minimizes the maximum travel time and disparity between members.
  2. **Quickest Overall:** Minimizes total/average group travel time.
  3. **Best Group Match:** Balances rating, budget, and travel time.
- Single-route inspection: Tapping a member's travel time highlights only their road route on the map to prevent visual spaghetti.

### Screen 9: Group Voting
- 1 vote per participant.
- Real-time vote count tally.
- Host can close voting and lock in the winning venue.

### Screen 10: Final Meetup Confirmation
- Celebratory confirmation card with confirmed venue address, date/time, and individual routes.
- 1-tap Google Maps / Apple Maps navigation link.
- 1-tap Add to Calendar (.ics / Google Calendar).

### Screen 11: Explore Nearby
- Independent neighborhood discovery with category pills.
- 1-tap *"Start a Meetup Here"* button.

### Screen 12: Saved Places
- Bookmarked coordinates and favorite venues.

### Screen 13: Profile and Settings
- Adaptive theme selector (System, Light, Dark).
- Default transport preference (Car, Bike, Foot).
- Approximate location toggle (~500m fuzzing for home privacy).
- Version & connectivity status.
