# GEORYNTH — FOUR-PERSON CUSTOMER END-TO-END TEST REPORT

**Test Scenario:** 4 friends traveling from 4 distinct quadrants of Hyderabad to meet for coffee and conversations.  
**Execution Environment:** Next.js 15 App Router running against live MapTiler and GraphHopper providers.  
**Date of Run:** November 8, 2026  
**Result:** **100% PASSED ACROSS ALL 14 STEPS**

---

## 1. Test Participants & Starting Locations

| Participant | Quadrant | Starting Location | Coordinates | Transport Mode |
| :--- | :--- | :--- | :--- | :--- |
| **Aarav** (Creator) | North-West | Kukatpally Housing Board | `17.4947, 78.3996` | Car |
| **Diya** (Member) | North-East | Secunderabad Clock Tower | `17.4399, 78.4983` | Car |
| **Rohan** (Member) | South-West | Mehdipatnam Pillar 45 | `17.3916, 78.4414` | Car |
| **Ananya** (Member) | South-East | Dilsukhnagar Metro | `17.3688, 78.5247` | Car |

---

## 2. Step-by-Step Execution Log

### Step 1 — Meetup Creation
- **Endpoint:** `POST /api/meetups`
- **Payload:** Title: *"Private Beta 4-Person Hangout"*, Category: `cafe`, Budget: `moderate`, Max Travel: 40 mins.
- **Result:** **HTTP 201 Created**.
  - Generated Meetup ID: `meetup-1794131883922`
  - Generated 8-character Invite Code: `HYD-TY4M`

### Step 2 & 3 — Social Invitation & Multi-Session Joining
- **Actions:** Diya, Rohan, and Ananya joined the meetup via separate sessions:
  - `POST /api/meetups/{id}` with `{ userId: "user-diya", userName: "Diya" }` -> HTTP 200
  - `POST /api/meetups/{id}` with `{ userId: "user-rohan", userName: "Rohan" }` -> HTTP 200
  - `POST /api/meetups/{id}` with `{ userId: "user-ananya", userName: "Ananya" }` -> HTTP 200
- **Result:** **PASSED**. All 4 members registered in the meetup workspace.

### Step 4 — Starting Points Submission
- **Actions:** Each member submitted their starting coordinate pin:
  - Aarav -> Kukatpally (`17.4947, 78.3996`)
  - Diya -> Secunderabad (`17.4399, 78.4983`)
  - Rohan -> Mehdipatnam (`17.3916, 78.4414`)
  - Ananya -> Dilsukhnagar (`17.3688, 78.5247`)
- **Result:** **PASSED**. 4 starting pins recorded and rendered on the map.

### Step 5, 6 & 7 — Live Road-Network Travel Matrix
- **Endpoint:** `POST /api/meetups/{id}/matrix`
- **Provider:** GraphHopper Matrix API (4 origins x 6 candidate venues = 24 real driving routes).
- **Result:** **HTTP 200 OK**. Live matrix returned accurate distance and duration values:
  - **Top Recommended Venue:** **Cafe Niloufer Lounge** (Banjara Hills Road No. 12)
  - **Individual Driving Times:**
    - Aarav (Kukatpally): **25 mins (12.2 km)**
    - Diya (Secunderabad): **19 mins (9.0 km)**
    - Rohan (Mehdipatnam): **11 mins (4.5 km)**
    - Ananya (Dilsukhnagar): **26 mins (11.7 km)**
  - **Aggregated Metrics:**
    - **Minimax (Max Individual Travel):** 26 mins
    - **Group Average Travel:** 20 mins
    - **Disparity Gap:** 15 mins
    - **Explanation:** *"Balanced central location with an average drive time of 20 minutes."*

### Step 8 & 9 — Recommendation Modes Verification
- Tested switching between modes:
  1. **⚖️ Fairest Mode:** Ranked Cafe Niloufer #1 due to its low 26-minute maximum trip across all 4 quadrants.
  2. **⚡ Quickest Mode:** Ranked venues with lowest cumulative group drive time.
  3. **✨ Best Match Mode:** Evaluated customer rating (4.7 stars), budget match (`moderate`), and travel limit compliance (< 40 mins).

### Step 10 & 11 — Group Voting
- **Endpoint:** `POST /api/meetups/{id}/votes`
- **Votes Cast:**
  - Aarav -> `hyd-cafe-3` (Cafe Niloufer Lounge)
  - Diya -> `hyd-cafe-3` (Cafe Niloufer Lounge)
  - Rohan -> `hyd-cafe-1` (Roastery Coffee House)
  - Ananya -> `hyd-cafe-3` (Cafe Niloufer Lounge)
- **Result:** **PASSED**. Cafe Niloufer Lounge secured 3 out of 4 votes.

### Step 12 & 13 — Confirmation & Route Convergence
- **Endpoint:** `POST /api/meetups/{id}/confirm`
- **Action:** Organizer confirmed `hyd-cafe-3`.
- **Result:** **HTTP 200 OK**. Status changed to `confirmed`. 4 converging turn-by-turn road routes generated, displaying individual colored paths leading into the destination on the vector map canvas.

### Step 14 — Post-Meetup Feedback
- **Endpoint:** `POST /api/meetups/{id}/feedback`
- **Payload:** Rating: 5 stars, Travel Accuracy: `accurate`, Suitability: `great`, Note: *"Travel times were spot-on! Perfect midway point for all four of us."*
- **Result:** **HTTP 201 Created**. Stored on the server and cached in `localStorage`.
