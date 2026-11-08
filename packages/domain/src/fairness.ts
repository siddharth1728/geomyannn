import { CandidateVenue, ParticipantTravelTime, RankingMode, MeetupPreferences } from "./types/meetup";

export interface FairnessMetrics {
  avgDurationSec: number;
  maxDurationSec: number;
  minDurationSec: number;
  disparitySec: number;
  totalDurationSec: number;
  recommendationReason: string;
}

export function computeFairnessMetrics(participantTimes: ParticipantTravelTime[]): FairnessMetrics {
  const durations = participantTimes.map((pt) => pt.durationSeconds);
  if (durations.length === 0) {
    return {
      avgDurationSec: 0,
      maxDurationSec: 0,
      minDurationSec: 0,
      disparitySec: 0,
      totalDurationSec: 0,
      recommendationReason: "Awaiting participant locations to calculate travel fairness.",
    };
  }

  const totalDurationSec = durations.reduce((a, b) => a + b, 0);
  const avgDurationSec = Math.round(totalDurationSec / durations.length);
  const maxDurationSec = Math.max(...durations);
  const minDurationSec = Math.min(...durations);
  const disparitySec = maxDurationSec - minDurationSec;
  const disparityMin = Math.round(disparitySec / 60);

  let recommendationReason = "";
  if (disparityMin <= 10) {
    recommendationReason = `Exceptional fairness: only a ${disparityMin}-minute gap between closest and farthest friend.`;
  } else if (disparityMin <= 18) {
    recommendationReason = `Balanced central location with an average drive time of ${Math.round(avgDurationSec / 60)} minutes.`;
  } else {
    recommendationReason = `Convenient for some members, but involves up to a ${Math.round(maxDurationSec / 60)}-minute trip for others.`;
  }

  return {
    avgDurationSec,
    maxDurationSec,
    minDurationSec,
    disparitySec,
    totalDurationSec,
    recommendationReason,
  };
}

export function rankVenues(
  venues: CandidateVenue[],
  mode: RankingMode,
  preferences?: MeetupPreferences
): CandidateVenue[] {
  if (!venues || venues.length === 0) return [];
  const cloned = [...venues];

  switch (mode) {
    case "fairest":
      // Minimax Fairness Strategy:
      // 1. Primary: Lowest maximum individual travel time (protect the most burdened traveler)
      // 2. Secondary: Lowest average group travel time (tie-breaker for group efficiency)
      // 3. Tertiary: Lowest travel-time disparity (tie-breaker for balanced journeys)
      return cloned.sort((a, b) => {
        const maxA = a.maxDurationSec ?? Infinity;
        const maxB = b.maxDurationSec ?? Infinity;
        if (maxA !== maxB) {
          return maxA - maxB;
        }

        const avgA = a.avgDurationSec ?? Infinity;
        const avgB = b.avgDurationSec ?? Infinity;
        if (avgA !== avgB) {
          return avgA - avgB;
        }

        const dispA = a.disparitySec ?? 0;
        const dispB = b.disparitySec ?? 0;
        return dispA - dispB;
      });

    case "quickest":
      // Minimizes total/average group travel time across the network
      return cloned.sort((a, b) => {
        const avgA = a.avgDurationSec ?? Infinity;
        const avgB = b.avgDurationSec ?? Infinity;
        if (avgA !== avgB) return avgA - avgB;
        return (a.maxDurationSec ?? Infinity) - (b.maxDurationSec ?? Infinity);
      });

    case "best_match":
      // Multi-Attribute Utility Optimization:
      // - Rating base: rating * 10 (contributes 10-50 pts; 10 pts = 1.0 star)
      // - Travel efficiency: - (avgDurationSec / 120) (each 2 mins drive = -1 pt, 10 mins = -5 pts)
      // - Budget alignment: +5 pts (equivalent to +0.5 star bonus for exact price tier match)
      // - Max travel violation: -8 pts (equivalent to -0.8 star / 16-min penalty if someone's journey exceeds limit)
      return cloned.sort((a, b) => {
        const ratingA = typeof a.rating === "number" && !isNaN(a.rating) ? a.rating : 4.0;
        const ratingB = typeof b.rating === "number" && !isNaN(b.rating) ? b.rating : 4.0;
        const avgSecA = a.avgDurationSec ?? 1800;
        const avgSecB = b.avgDurationSec ?? 1800;

        let scoreA = ratingA * 10 - avgSecA / 120;
        let scoreB = ratingB * 10 - avgSecB / 120;

        if (preferences?.budget && preferences.budget !== "any") {
          if (a.priceLevel && a.priceLevel === preferences.budget) scoreA += 5;
          if (b.priceLevel && b.priceLevel === preferences.budget) scoreB += 5;
        }

        if (preferences?.maxTravelTimeMinutes && preferences.maxTravelTimeMinutes > 0) {
          const maxAllowedSec = preferences.maxTravelTimeMinutes * 60;
          if ((a.maxDurationSec ?? 0) > maxAllowedSec) scoreA -= 8;
          if ((b.maxDurationSec ?? 0) > maxAllowedSec) scoreB -= 8;
        }

        return scoreB - scoreA;
      });

    default:
      return cloned;
  }
}
