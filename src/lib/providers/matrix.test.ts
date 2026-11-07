import { describe, it, expect } from "vitest";
import { rankVenues } from "./matrix";
import { CandidateVenue } from "@/types/meetup";

describe("Group Travel Matrix & Fairness Engine", () => {
  const mockVenues: CandidateVenue[] = [
    {
      id: "v-1",
      meetupId: "m-1",
      venueId: "venue-far-disparity",
      name: "Distant Grill",
      category: "restaurant",
      address: "Outskirts",
      latitude: 17.5,
      longitude: 78.5,
      rating: 4.8,
      avgDurationSec: 1500, // 25 min avg
      maxDurationSec: 2400, // 40 min max
      minDurationSec: 600,  // 10 min min
      disparitySec: 1800,   // 30 min gap (unfair)
      totalDurationSec: 6000,
      recommendationReason: "Unbalanced travel gap",
      participantTimes: [],
      voteCount: 0,
    },
    {
      id: "v-2",
      meetupId: "m-1",
      venueId: "venue-fair",
      name: "Equidistant Bistro",
      category: "restaurant",
      address: "Banjara Hills",
      latitude: 17.42,
      longitude: 78.44,
      rating: 4.5,
      avgDurationSec: 1200, // 20 min avg
      maxDurationSec: 1320, // 22 min max
      minDurationSec: 1080, // 18 min min
      disparitySec: 240,    // only 4 min gap (very fair!)
      totalDurationSec: 4800,
      recommendationReason: "Exceptional fairness",
      participantTimes: [],
      voteCount: 0,
    },
    {
      id: "v-3",
      meetupId: "m-1",
      venueId: "venue-fastest",
      name: "Central Express Dine",
      category: "restaurant",
      address: "Somajiguda",
      latitude: 17.43,
      longitude: 78.45,
      rating: 4.2,
      avgDurationSec: 900,  // 15 min avg (quickest overall)
      maxDurationSec: 1500, // 25 min max
      minDurationSec: 500,  // 8 min min
      disparitySec: 1000,   // ~16 min gap
      totalDurationSec: 3600,
      recommendationReason: "Quickest group time",
      participantTimes: [],
      voteCount: 0,
    },
  ];

  it("prioritizes venue with lowest travel-time disparity in 'fairest' mode", () => {
    const ranked = rankVenues(mockVenues, "fairest");
    expect(ranked[0].venueId).toBe("venue-fair");
    expect(ranked[0].disparitySec).toBe(240);
  });

  it("prioritizes venue with lowest average travel time in 'quickest' mode", () => {
    const ranked = rankVenues(mockVenues, "quickest");
    expect(ranked[0].venueId).toBe("venue-fastest");
    expect(ranked[0].avgDurationSec).toBe(900);
  });

  it("considers user ratings in 'best_match' mode", () => {
    const ranked = rankVenues(mockVenues, "best_match");
    expect(ranked.length).toBe(3);
    expect(ranked[0].rating).toBeGreaterThanOrEqual(4.5);
  });
});
