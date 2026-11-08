import { describe, it, expect } from "vitest";
import { computeFairnessMetrics, rankVenues } from "./fairness";
import { CandidateVenue, ParticipantTravelTime } from "./types/meetup";

describe("@georynth/domain fairness algorithms", () => {
  it("calculates accurate fairness metrics for 2, 4, and 6 participants", () => {
    // 2 Participants
    const twoPeople: ParticipantTravelTime[] = [
      { memberId: "m1", memberName: "Aarav", originLabel: "Kukatpally", durationSeconds: 900, distanceMeters: 6000 },
      { memberId: "m2", memberName: "Diya", originLabel: "Banjara Hills", durationSeconds: 1500, distanceMeters: 10000 },
    ];
    const metrics2 = computeFairnessMetrics(twoPeople);
    expect(metrics2.avgDurationSec).toBe(1200);
    expect(metrics2.disparitySec).toBe(600); // 10 mins

    // 4 Participants (Hyderabad core test)
    const fourPeople: ParticipantTravelTime[] = [
      { memberId: "m1", memberName: "Aarav", originLabel: "Kukatpally", durationSeconds: 1200, distanceMeters: 8000 },
      { memberId: "m2", memberName: "Diya", originLabel: "Secunderabad", durationSeconds: 1500, distanceMeters: 9500 },
      { memberId: "m3", memberName: "Rohan", originLabel: "Mehdipatnam", durationSeconds: 1800, distanceMeters: 11000 },
      { memberId: "m4", memberName: "Ananya", originLabel: "Dilsukhnagar", durationSeconds: 1500, distanceMeters: 9800 },
    ];
    const metrics4 = computeFairnessMetrics(fourPeople);
    expect(metrics4.avgDurationSec).toBe(1500);
    expect(metrics4.maxDurationSec).toBe(1800);
    expect(metrics4.minDurationSec).toBe(1200);
    expect(metrics4.disparitySec).toBe(600);

    // 6 Participants
    const sixPeople: ParticipantTravelTime[] = [
      ...fourPeople,
      { memberId: "m5", memberName: "Vikram", originLabel: "Gachibowli", durationSeconds: 2100, distanceMeters: 14000 },
      { memberId: "m6", memberName: "Pooja", originLabel: "Madhapur", durationSeconds: 1200, distanceMeters: 7500 },
    ];
    const metrics6 = computeFairnessMetrics(sixPeople);
    expect(metrics6.maxDurationSec).toBe(2100);
    expect(metrics6.minDurationSec).toBe(1200);
    expect(metrics6.disparitySec).toBe(900); // 15 mins
  });

  it("handles equal journey times (perfect zero disparity)", () => {
    const equalTimes: ParticipantTravelTime[] = [
      { memberId: "m1", memberName: "Aarav", originLabel: "Kukatpally", durationSeconds: 1200, distanceMeters: 8000 },
      { memberId: "m2", memberName: "Diya", originLabel: "Secunderabad", durationSeconds: 1200, distanceMeters: 8000 },
      { memberId: "m3", memberName: "Rohan", originLabel: "Mehdipatnam", durationSeconds: 1200, distanceMeters: 8000 },
    ];
    const metrics = computeFairnessMetrics(equalTimes);
    expect(metrics.disparitySec).toBe(0);
    expect(metrics.avgDurationSec).toBe(1200);
    expect(metrics.recommendationReason).toContain("Exceptional fairness: only a 0-minute gap");
  });

  it("prioritizes lowest maximum travel time (minimax) over raw zero disparity", () => {
    // Venue A has 0 disparity, but everyone travels 50 minutes (3000s)
    const venueEqualMisery: CandidateVenue = {
      id: "v-misery",
      meetupId: "m1",
      venueId: "v-misery",
      name: "Distant Outpost",
      category: "restaurant",
      address: "Outer Ring Road",
      latitude: 17.55,
      longitude: 78.35,
      rating: 4.5,
      avgDurationSec: 3000,
      maxDurationSec: 3000,
      minDurationSec: 3000,
      disparitySec: 0,
      totalDurationSec: 6000,
      recommendationReason: "Far for all",
      participantTimes: [],
      voteCount: 0,
    };

    // Venue B has 10 min disparity, but maximum trip is only 25 minutes (1500s)
    const venueFairComfort: CandidateVenue = {
      id: "v-comfort",
      meetupId: "m1",
      venueId: "v-comfort",
      name: "Central Cafe",
      category: "cafe",
      address: "Banjara Hills",
      latitude: 17.41,
      longitude: 78.43,
      rating: 4.5,
      avgDurationSec: 1200,
      maxDurationSec: 1500,
      minDurationSec: 900,
      disparitySec: 600,
      totalDurationSec: 2400,
      recommendationReason: "Central spot",
      participantTimes: [],
      voteCount: 0,
    };

    const ranked = rankVenues([venueEqualMisery, venueFairComfort], "fairest");
    // Minimax fairness: venueFairComfort MUST win because its max is 1500s vs 3000s
    expect(ranked[0].id).toBe("v-comfort");
  });

  it("uses average duration and disparity as tie-breakers when maxDurationSec is identical", () => {
    const venue1: CandidateVenue = {
      id: "v1",
      meetupId: "m1",
      venueId: "v1",
      name: "Spot 1",
      category: "cafe",
      address: "Road 1",
      latitude: 17.41,
      longitude: 78.43,
      avgDurationSec: 1400,
      maxDurationSec: 1800,
      minDurationSec: 1000,
      disparitySec: 800,
      totalDurationSec: 2800,
      recommendationReason: "Test",
      participantTimes: [],
      voteCount: 0,
    };

    const venue2: CandidateVenue = {
      id: "v2",
      meetupId: "m1",
      venueId: "v2",
      name: "Spot 2",
      category: "cafe",
      address: "Road 2",
      latitude: 17.42,
      longitude: 78.44,
      avgDurationSec: 1200, // lower average wins tie-break!
      maxDurationSec: 1800, // same max
      minDurationSec: 600,
      disparitySec: 1200,
      totalDurationSec: 2400,
      recommendationReason: "Test",
      participantTimes: [],
      voteCount: 0,
    };

    const ranked = rankVenues([venue1, venue2], "fairest");
    expect(ranked[0].id).toBe("v2");
  });

  it("handles Best Match budget matching bonus (+5) and travel constraint penalty (-8)", () => {
    const venueBudgetMatch: CandidateVenue = {
      id: "v-budget",
      meetupId: "m1",
      venueId: "v-budget",
      name: "Budget Bistro",
      category: "cafe",
      address: "Somajiguda",
      latitude: 17.42,
      longitude: 78.45,
      rating: 4.2,
      priceLevel: "budget",
      avgDurationSec: 1200, // 10 mins
      maxDurationSec: 1500, // 25 mins
      minDurationSec: 900,
      disparitySec: 600,
      totalDurationSec: 2400,
      recommendationReason: "Budget",
      participantTimes: [],
      voteCount: 0,
    };

    const venuePremium: CandidateVenue = {
      id: "v-premium",
      meetupId: "m1",
      venueId: "v-premium",
      name: "Luxury Dining",
      category: "restaurant",
      address: "Jubilee Hills",
      latitude: 17.43,
      longitude: 78.41,
      rating: 4.6, // Higher base rating
      priceLevel: "premium",
      avgDurationSec: 1200,
      maxDurationSec: 1500,
      minDurationSec: 900,
      disparitySec: 600,
      totalDurationSec: 2400,
      recommendationReason: "Premium",
      participantTimes: [],
      voteCount: 0,
    };

    // When budget preference is "budget", +5 bonus flips the higher rated premium venue
    const rankedWithBudget = rankVenues([venuePremium, venueBudgetMatch], "best_match", {
      category: "cafe",
      budget: "budget",
      cuisine: "any",
      dietary: "any",
      atmosphere: "casual",
    });
    expect(rankedWithBudget[0].id).toBe("v-budget");

    // When max travel time is 20 minutes (1200s), venue with maxDuration 1500s is penalized (-8)
    const venueWithinLimit: CandidateVenue = {
      ...venueBudgetMatch,
      id: "v-within",
      venueId: "v-within",
      rating: 3.9,
      maxDurationSec: 1100, // < 1200s limit
    };
    const venueExceedingLimit: CandidateVenue = {
      ...venueBudgetMatch,
      id: "v-exceed",
      venueId: "v-exceed",
      rating: 4.4, // Higher rating but exceeds limit!
      maxDurationSec: 2200, // > 1200s limit
    };

    const rankedWithLimit = rankVenues([venueExceedingLimit, venueWithinLimit], "best_match", {
      category: "cafe",
      budget: "any",
      cuisine: "any",
      dietary: "any",
      atmosphere: "casual",
      maxTravelTimeMinutes: 20,
    });
    expect(rankedWithLimit[0].id).toBe("v-within");
  });

  it("handles missing data gracefully (no ratings, missing prices, undefined duration, empty list)", () => {
    // Empty venue array
    expect(rankVenues([], "fairest")).toEqual([]);

    // Venues with missing ratings and priceLevel
    const sparseVenueA: CandidateVenue = {
      id: "v-sparse-a",
      meetupId: "m1",
      venueId: "v-sparse-a",
      name: "Unrated Diner",
      category: "restaurant",
      address: "Address A",
      latitude: 17.4,
      longitude: 78.4,
      avgDurationSec: 1000,
      maxDurationSec: 1200,
      minDurationSec: 800,
      disparitySec: 400,
      totalDurationSec: 2000,
      recommendationReason: "Unrated",
      participantTimes: [],
      voteCount: 0,
    };

    const sparseVenueB: CandidateVenue = {
      id: "v-sparse-b",
      meetupId: "m1",
      venueId: "v-sparse-b",
      name: "Diner B",
      category: "restaurant",
      address: "Address B",
      latitude: 17.41,
      longitude: 78.41,
      avgDurationSec: 1500,
      maxDurationSec: 1800,
      minDurationSec: 1200,
      disparitySec: 600,
      totalDurationSec: 3000,
      recommendationReason: "Unrated",
      participantTimes: [],
      voteCount: 0,
    };

    const ranked = rankVenues([sparseVenueB, sparseVenueA], "best_match");
    expect(ranked.length).toBe(2);
    expect(ranked[0].id).toBe("v-sparse-a");
  });
});
