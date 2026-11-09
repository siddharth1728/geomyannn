import { CandidateVenue, ParticipantLocation, ParticipantTravelTime, RankingMode, MeetupPreferences } from "@/types/meetup";
import { RoutingProfile } from "@/types/geo";

interface MatrixRequestOrigin {
  memberId: string;
  memberName: string;
  label: string;
  latitude: number;
  longitude: number;
}

interface MatrixRequestDestination {
  venueId: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  priceLevel?: string;
  imageUrl?: string;
}

export interface GraphHopperMatrixResponse {
  distances: number[][]; // [from_index][to_index] in meters
  times: number[][];     // [from_index][to_index] in seconds
  info?: {
    copyrights?: string[];
  };
}

export async function calculateGroupTravelMatrix(
  origins: MatrixRequestOrigin[],
  destinations: MatrixRequestDestination[],
  profile: RoutingProfile = "car",
  meetupId: string = "meetup-default"
): Promise<{ venues: CandidateVenue[]; error?: string }> {
  const apiKey = process.env.GRAPHHOPPER_API_KEY;

  if (!apiKey) {
    return {
      venues: [],
      error: "GraphHopper API key is missing. Set GRAPHHOPPER_API_KEY in .env.local",
    };
  }

  if (origins.length === 0 || destinations.length === 0) {
    return { venues: [] };
  }

  const profileMap: Record<RoutingProfile, string> = {
    car: process.env.GRAPHHOPPER_PROFILE_CAR || "car",
    bike: process.env.GRAPHHOPPER_PROFILE_BIKE || "bike",
    foot: process.env.GRAPHHOPPER_PROFILE_FOOT || "foot",
  };

  const selectedProfile = profileMap[profile] || "car";

  try {
    const url = `https://graphhopper.com/api/1/matrix?key=${apiKey}`;

    const from_points = origins.map((o) => [o.longitude, o.latitude]);
    const to_points = destinations.map((d) => [d.longitude, d.latitude]);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from_points,
        to_points,
        out_arrays: ["times", "distances"],
        profile: selectedProfile,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.message || `Matrix API request failed with status ${res.status}`);
    }

    const data = (await res.json()) as GraphHopperMatrixResponse;
    const { times, distances } = data;

    // Build candidate venues with real metrics & transparent explanations
    const computedVenues: CandidateVenue[] = destinations.map((dest, destIdx) => {
      let isFullyRoutable = true;
      const participantTimes: ParticipantTravelTime[] = origins.map((orig, origIdx) => {
        const rawTime = times[origIdx]?.[destIdx];
        const rawDist = distances[origIdx]?.[destIdx];

        // Explicit null handling: never convert missing or unroutable journeys to 0 seconds!
        if (rawTime === null || rawTime === undefined || rawDist === null || rawDist === undefined) {
          isFullyRoutable = false;
        }

        const durationSec = rawTime !== null && rawTime !== undefined ? Math.round(rawTime) : 999999;
        const distanceMeters = rawDist !== null && rawDist !== undefined ? Math.round(rawDist) : 999999;

        return {
          memberId: orig.memberId,
          memberName: orig.memberName,
          originLabel: orig.label,
          durationSeconds: durationSec,
          distanceMeters,
        };
      });

      const validDurations = participantTimes
        .map((pt) => pt.durationSeconds)
        .filter((d) => d < 900000);

      const totalDurationSec = validDurations.reduce((a, b) => a + b, 0);
      const avgDurationSec = validDurations.length > 0 ? Math.round(totalDurationSec / validDurations.length) : 999999;
      const maxDurationSec = validDurations.length > 0 ? Math.max(...validDurations) : 999999;
      const minDurationSec = validDurations.length > 0 ? Math.min(...validDurations) : 999999;
      const disparitySec = maxDurationSec - minDurationSec;
      const disparityMin = Math.round(disparitySec / 60);

      // Transparent, plain-English explanation instead of an arbitrary score
      let recommendationReason = "";
      if (!isFullyRoutable) {
        recommendationReason = "Incomplete road network: journey unavailable or unroutable for one or more participants.";
      } else if (disparityMin <= 10) {
        recommendationReason = `Exceptional fairness: only a ${disparityMin}-minute gap between closest and farthest friend.`;
      } else if (disparityMin <= 18) {
        recommendationReason = `Balanced central location with an average drive time of ${Math.round(avgDurationSec / 60)} minutes.`;
      } else {
        recommendationReason = `Convenient for ${origins.find((_, i) => participantTimes[i]?.durationSeconds === minDurationSec)?.memberName || "some members"}, but involves up to a ${Math.round(maxDurationSec / 60)}-minute trip.`;
      }

      return {
        id: `c-venue-${dest.venueId}`,
        meetupId,
        venueId: dest.venueId,
        name: dest.name,
        category: dest.category,
        address: dest.address,
        latitude: dest.latitude,
        longitude: dest.longitude,
        rating: dest.rating,
        priceLevel: dest.priceLevel,
        imageUrl: dest.imageUrl,
        avgDurationSec,
        maxDurationSec,
        minDurationSec,
        disparitySec,
        totalDurationSec,
        recommendationReason,
        participantTimes,
        voteCount: 0,
      };
    });

    return { venues: computedVenues };
  } catch (error: any) {
    console.warn("Matrix calculation error:", error);
    return {
      venues: [],
      error: error.message || "Failed to calculate group travel matrix",
    };
  }
}

/**
 * Sort venues according to user-selected recommendation mode:
 * 1. Fairest for Everyone (Minimax individual travel, tie-breaker avg time & disparity)
 * 2. Quickest Overall (Lowest total/average travel time)
 * 3. Best Group Match (Utility optimization with budget bonuses & travel penalties)
 */
export { rankVenues } from "@georynth/domain";
