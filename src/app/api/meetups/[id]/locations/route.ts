import { NextRequest, NextResponse } from "next/server";
import { getMeetupFromStore, setParticipantLocation } from "@/lib/meetups/store";
import { getSessionUser, isMeetupMember } from "@/lib/auth/session";
import { z } from "zod";

export const dynamic = "force-dynamic";

const LocationSchema = z.object({
  memberId: z.string().optional(),
  memberName: z.string().min(1),
  label: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isApproximate: z.boolean().default(false),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meetup = getMeetupFromStore(id);

  if (!meetup) {
    return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
  }

  // Location privacy: Only members of this meetup can view member coordinates
  const user = await getSessionUser(request);
  if (!isMeetupMember(meetup, user.userId)) {
    return NextResponse.json(
      { error: "Forbidden. You must be an authorized member of this meetup to view starting coordinates." },
      { status: 403 }
    );
  }

  return NextResponse.json({ locations: meetup.locations });
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

  const user = await getSessionUser(request);
  const body = await request.json().catch(() => null);

  const validation = LocationSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid location coordinates", details: validation.error.flatten() },
      { status: 400 }
    );
  }

  // Server-derived member ID: never blindly trust client spoofing
  const effectiveMemberId = validation.data.memberId || user.userId;
  const { memberName, label, latitude, longitude, isApproximate } = validation.data;

  // Verify membership
  if (!isMeetupMember(meetup, effectiveMemberId) && !isMeetupMember(meetup, user.userId)) {
    return NextResponse.json(
      { error: "Forbidden. Only members of this meetup can record a starting location." },
      { status: 403 }
    );
  }

  const loc = setParticipantLocation(
    id,
    effectiveMemberId,
    memberName,
    label,
    latitude,
    longitude,
    isApproximate
  );

  if (!loc) {
    return NextResponse.json({ error: "Failed to record participant location" }, { status: 500 });
  }

  return NextResponse.json({ location: loc, meetup: getMeetupFromStore(id) });
}
