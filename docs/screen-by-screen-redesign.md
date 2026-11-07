# GEORYNTH — Screen-by-Screen Redesign Specification
**Product:** GEORYNTH  
**Coverage:** 10 Core Application Screens & States across Desktop, Tablet, and Mobile Web

---

## Screen 1: The Adaptive Homepage ("Let's Make a Plan")

### Purpose
Greet the user with an energizing, clutter-free social space that invites them to create, join, or explore.

### UI Structure
- **Top Header**: Brand mark, "Find a place everyone can reach", quick tab switcher, Theme toggle (Light/Dark/System), Settings avatar.
- **Left Dock Panel**:
  - Greeting headline: *"Let's make a plan."*
  - Subtitle: *"Coordinate where to meet in seconds based on real travel times."*
  - **3 Core Action Cards**:
    1. **Plan a Meetup** (Emerald primary button with `+` icon)
    2. **Join with Code** (Surface card with input field & arrow)
    3. **Explore Nearby** (Compass icon to browse top spots)
  - **Quick Demo Card (Hyderabad Hangout)**:
    - *"Try the live scenario: 4 friends meeting in Hyderabad."*
    - One-click trigger that loads Aarav, Diya, Rohan, and Ananya, computes GraphHopper routes, and plots Roastery Coffee House.
- **Right Map**:
  - Interactive MapLibre GL vector canvas showing city streets with clean POI icons.

---

## Screen 2: Guided Meetup Creation Wizard (3 Steps)

### Step 1: "What are we doing?"
- 8 Student-friendly vibe chips:
  - ☕ Cafe & Study
  - 🍕 Pizza & Quick Bites
  - 🍛 Biryani & Dinner
  - 🎬 Cinema & Movies
  - 🌳 Outdoors & Park
  - 🛍️ Shopping
  - 🎮 Gaming & Arcade
  - ✨ Surprise Us
- Input field: Meetup Title (e.g., *"Weekend Biryani Hangout"*).

### Step 2: "When are we meeting?"
- Quick presets:
  - `Today 7:00 PM`
  - `Tomorrow Evening`
  - `This Saturday 1:00 PM`
  - `Custom Date & Time Picker`

### Step 3: "Group Constraints"
- Budget selector: `₹ Budget` | `₹₹ Moderate` | `₹₹₹ Premium` | `Any`
- Travel mode default: `Car` | `Bike / Scooter` | `Walking / Metro`
- Max travel time slider: 15 min to 60 min.

---

## Screen 3: The Meetup Lobby & Invite Sharing

### Purpose
The gathering space while friends join and provide their starting points.

### UI Elements
- **Meetup Header**: Title, Planned time, status pill (`Planning / Voting`).
- **Invite Box**:
  - 6-character code (e.g. `HYD789`) with 1-click Copy.
  - **WhatsApp Share Button**: Generates pre-filled text invite.
- **Participant Roster**:
  - Compact avatar circles with online pulse indicators.
  - Location badge: *"Kukatpally (Shared)"* vs *"Waiting for location"*.
  - Manual pin drop option for privacy.
- **Map Synchronization**:
  - As participants add locations, map markers automatically drop with high-contrast initials and location labels.

---

## Screen 4: Place Discovery & Search Mode

### Purpose
Explore places near any neighborhood or group centroid.

### UI Elements
- **Global Search Field**:
  - Placeholder: *"Search places, restaurants, cafes..."*
  - Debounced geocoding autocomplete with instant place cards.
- **Category Filter Rail**:
  - Horizontal scrollable chips with icons.
- **Results List**:
  - High-resolution venue photos (when available).
  - Clean card layout with rating stars, price symbols, and distance in meters/kilometers.
  - Hovering card highlights the corresponding pin on the map.

---

## Screen 5: Group Recommendations & Fairness Matrix Cockpit

### Purpose
The brain of GEORYNTH: comparing candidate venues based on real GraphHopper road matrix computation.

### Three Ranking Modes (Segmented Switcher)
1. **Fairest for Everyone**: Minimizes travel disparity between participants.
2. **Quickest Overall**: Minimizes the total cumulative travel time.
3. **Best Group Match**: Weighs user ratings, atmosphere, and dietary requirements.

### Venue Card Anatomy
- **Header**: Venue Name (15px bold), Category, Rating (`4.6 ★`).
- **Fairness Badge**: e.g., *"#1 Most Fair (Avg 22m, Max 28m)"*.
- **Expandable Drawer ("See travel for each friend")**:
  - Aarav (Kukatpally): 22 min drive (11.2 km)
  - Diya (Secunderabad): 20 min drive (9.4 km)
  - Rohan (Mehdipatnam): 18 min drive (8.1 km)
  - Ananya (Dilsukhnagar): 28 min drive (13.6 km)
- **Action Buttons**:
  - `Vote for this Place`
  - `Confirm as Final Location`

---

## Screen 6: The Turn-by-Turn Inspection ("Navigate")

### Purpose
Inspect actual converging road routes.

### Visual Rules
- Avoid clutter: Never draw 10 conflicting polylines with heavy opacities.
- When inspecting a venue, render high-contrast colored polylines from each friend's origin to the venue.
- Clicking any participant highlights only their route, displaying distance and duration in an unobtrusive bottom-left card.

---

## Screen 7: Confirmed Meetup & Celebration View

### Purpose
Celebrate reaching group consensus and give everyone turn-by-turn navigation links.

### UI Elements
- Celebration banner: *"Meetup Confirmed! See you at Roastery Coffee House."*
- Date & Time confirmation pill with calendar export (`.ics` / Google Calendar).
- Direct link: *"Open in Google Maps Directions"*.
- Group status: Complete lock on voting; routes permanently highlighted.

---

## Screen 8: My Meetups Manager

### Purpose
Review active, upcoming, and past meetups.

### UI Elements
- Tabbed filters: `All`, `Active`, `Past`.
- Clean card listing with participant count, venue name, and planned time.
- 1-click resumption of any active meetup workspace.

---

## Screen 9: Saved Places

### Purpose
Personal bookmarks of favorite meetup spots.

### UI Elements
- Grid/list of bookmarked cafes and restaurants.
- Quick action: *"Plan a Meetup Here"*.

---

## Screen 10: Profile & App Settings

### Purpose
User preferences, privacy controls, and system diagnostics without cluttering the primary UI.

### UI Elements
- Theme preference: `System (Default)`, `Light`, `Dark`.
- Default transport mode: `Driving (Car)`, `Motorcycle / Scooter`, `Transit / Walking`.
- Privacy setting: `Approximate Location Only (500m fuzzing)` toggle.
- System Diagnostics: Live status of MapTiler, GraphHopper, and Supabase connections.
