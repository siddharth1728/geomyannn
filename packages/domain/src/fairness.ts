import { CandidateVenue, ParticipantTravelTime, RankingMode } from "./types/meetup";

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

export function rankVenues(venues: CandidateVenue[], mode: RankingMode): CandidateVenue[] {
  const cloned = [...venues];

  switch (mode) {
    case "fairest":
      // Minimizes disparity between participants, then minimizes maximum travel time
      return cloned.sort((a, b) => {
        if (a.disparitySec !== b.disparitySec) {
          return a.disparitySec - b.disparitySec;
        }
        return a.maxDurationSec - b.maxDurationSec;
      });

    case "quickest":
      // Minimizes total/average group travel time
      return cloned.sort((a, b) => a.avgDurationSec - b.avgDurationSec);

    case "best_match":
      // Balances customer rating with travel convenience
      return cloned.sort((a, b) => {
        const ratingA = a.rating ?? 4.0;
        const ratingB = b.rating ?? 4.0;
        const scoreA = ratingA * 10 - a.avgDurationSec / 120;
        const scoreB = ratingB * 10 - b.avgDurationSec / 120;
        return scoreB - scoreA;
      });

    default:
      return cloned;
  }
}
