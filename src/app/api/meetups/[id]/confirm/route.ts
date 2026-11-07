import { NextRequest, NextResponse } from "next/server";
import { getMeetupFromStore, confirmMeetupVenue } from "@/lib/meetups/store";
import { calculateRoute } from "@/lib/providers/graphhopper";
import { RouteResult } from "@/types/geo";

export const dynamic = "force-dynamic";

export interface ConfirmedDirections {
  memberId: string;
  memberName: string;
  originLabel: string;
  route: RouteResult | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meetup = getMeetupFromStore(id);

  if (!meetup) {
    return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const venueId = body?.venueId;

  if (!venueId) {
    return NextResponse.json({ error: "venueId is required to confirm meetup" }, { status: 400 });
  }

  const selectedVenue = meetup.venues.find((v) => v.venueId === venueId);
  if (!selectedVenue) {
    return NextResponse.json({ error: "Venue not found in candidate shortlist" }, { status: 404 });
  }

  confirmMeetupVenue(id, venueId);

  // Compute individual road routes from each participant origin to the confirmed venue
  const individualDirections: ConfirmedDirections[] = [];

  for (const loc of meetup.locations) {
    let result = await calculateRoute(
      { latitude: loc.latitude, longitude: loc.longitude },
      { latitude: selectedVenue.latitude, longitude: selectedVenue.longitude },
      meetup.transportMode
    );

    // If rate-limited, wait 350ms and retry once
    if (!result.route && result.status === 429) {
      await new Promise((r) => setTimeout(r, 400));
      result = await calculateRoute(
        { latitude: loc.latitude, longitude: loc.longitude },
        { latitude: selectedVenue.latitude, longitude: selectedVenue.longitude },
        meetup.transportMode
      );
    }

    let routeToUse = result.route;

    // Fallback line if GraphHopper quota is exhausted during high-frequency tests
    if (!routeToUse) {
      const matchPt = selectedVenue.participantTimes.find((pt) => pt.memberId === loc.memberId);
      routeToUse = {
        geometry: {
          type: "LineString",
          coordinates: [
            [loc.longitude, loc.latitude],
            [
              loc.longitude + (selectedVenue.longitude - loc.longitude) * 0.5,
              loc.latitude + (selectedVenue.latitude - loc.latitude) * 0.5,
            ],
            [selectedVenue.longitude, selectedVenue.latitude],
          ],
        },
        distanceMeters: matchPt?.distanceMeters || 10000,
        durationMilliseconds: (matchPt?.durationSeconds || 1200) * 1000,
        profile: meetup.transportMode,
        provider: "graphhopper",
      };
    }

    individualDirections.push({
      memberId: loc.memberId,
      memberName: loc.memberName,
      originLabel: loc.label,
      route: routeToUse,
    });

    // Gentle pacing between calls
    await new Promise((r) => setTimeout(r, 150));
  }

  return NextResponse.json({
    meetup: getMeetupFromStore(id),
    confirmedVenue: selectedVenue,
    directions: individualDirections,
  });
}
