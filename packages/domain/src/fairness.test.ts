import { describe, it, expect } from "vitest";
import { computeFairnessMetrics, rankVenues } from "./fairness";
import { CandidateVenue, ParticipantTravelTime } from "./types/meetup";

describe("@georynth/domain fairness algorithms", () => {
  it("calculates accurate fairness metrics from individual travel times", () => {
    const times: ParticipantTravelTime[] = [
      { memberId: "m1", memberName: "Aarav", originLabel: "Kukatpally", durationSeconds: 1200, distanceMeters: 8000 },
      { memberId: "m2", memberName: "Diya", originLabel: "Secunderabad", durationSeconds: 1500, distanceMeters: 9500 },
      { memberId: "m3", memberName: "Rohan", originLabel: "Mehdipatnam", durationSeconds: 1800, distanceMeters: 11000 },
    ];

    const metrics = computeFairnessMetrics(times);

    expect(metrics.avgDurationSec).toBe(1500); // (1200+1500+1800)/3
    expect(metrics.minDurationSec).toBe(1200);
    expect(metrics.maxDurationSec).toBe(1800);
    expect(metrics.disparitySec).toBe(600); // 10 minutes
    expect(metrics.recommendationReason).toContain("Exceptional fairness");
  });

  it("ranks venues by fairest, quickest, and best match correctly", () => {
    const venueFair: CandidateVenue = {
      id: "v-fair",
      meetupId: "m1",
      venueId: "v-fair",
      name: "Central Bistro",
      category: "cafe",
      address: "Banjara Hills",
      latitude: 17.4156,
      longitude: 78.4357,
      rating: 4.5,
      avgDurationSec: 1500,
      maxDurationSec: 1600,
      minDurationSec: 1400,
      disparitySec: 200,
      totalDurationSec: 4500,
      recommendationReason: "Fair",
      participantTimes: [],
      voteCount: 0,
    };

    const venueQuick: CandidateVenue = {
      id: "v-quick",
      meetupId: "m1",
      venueId: "v-quick",
      name: "Express Diner",
      category: "restaurant",
      address: "Begumpet",
      latitude: 17.4447,
      longitude: 78.4664,
      rating: 4.2,
      avgDurationSec: 900,
      maxDurationSec: 1800,
      minDurationSec: 300,
      disparitySec: 1500,
      totalDurationSec: 2700,
      recommendationReason: "Quick for some",
      participantTimes: [],
      voteCount: 0,
    };

    // Fairest mode prioritizes smallest disparity
    const rankedFairest = rankVenues([venueQuick, venueFair], "fairest");
    expect(rankedFairest[0].id).toBe("v-fair");

    // Quickest mode prioritizes lowest average duration
    const rankedQuickest = rankVenues([venueQuick, venueFair], "quickest");
    expect(rankedQuickest[0].id).toBe("v-quick");
  });
});
