import { NextRequest, NextResponse } from "next/server";
import { getMeetupFromStore, confirmMeetupVenue } from "@/lib/meetups/store";
import { calculateRoute } from "@/lib/providers/graphhopper";
import { getSessionUser, isMeetupHost, isMeetupMember } from "@/lib/auth/session";
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

  // Authorization check: User must be host or authorized member
  const user = await getSessionUser(request);
  if (!isMeetupHost(meetup, user.userId) && !isMeetupMember(meetup, user.userId)) {
    return NextResponse.json(
      { error: "Forbidden. Only authorized meetup host or members can confirm the venue." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const venueId = body?.venueId;

  if (!venueId) {
    return NextResponse.json({ error: "venueId is required to confirm meetup" }, { status: 400 });
  }

  const selectedVenue = meetup.venues.find((v) => v.venueId === venueId || v.id === venueId);
  if (!selectedVenue) {
    return NextResponse.json({ error: "Venue not found in candidate shortlist" }, { status: 404 });
  }

  confirmMeetupVenue(id, venueId);

  // Compute individual road routes from each participant origin to the confirmed venue
  const individualDirections: ConfirmedDirections[] = [];

  for (const loc of meetup.locations) {
    const result = await calculateRoute(
      { latitude: loc.latitude, longitude: loc.longitude },
      { latitude: selectedVenue.latitude, longitude: selectedVenue.longitude },
      meetup.transportMode
    );

    // HONEST ROUTING POLICY: If GraphHopper route is unavailable or quota is exhausted,
    // do NOT substitute a fake straight-line path claiming to be a real road calculation.
    individualDirections.push({
      memberId: loc.memberId,
      memberName: loc.memberName,
      originLabel: loc.label,
      route: result.route || null,
    });

    // Gentle pacing between external API calls
    await new Promise((r) => setTimeout(r, 100));
  }

  return NextResponse.json({
    meetup: getMeetupFromStore(id),
    confirmedVenue: selectedVenue,
    directions: individualDirections,
  });
}
